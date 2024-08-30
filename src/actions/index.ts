import { db } from "@/drizzle/db";
import {
	ArnisSeasonsTable,
	MatchArnisTechniquesTable,
	MatchCommentsTable,
	MatchesTable,
	MatchPlayersTable,
	MatchPlayerScoresTable,
	PlayerSeasonDetailsTable,
	SectionsTable,
	PowerCardsTable,
	PlayerPowerCardsTable,
} from "@/drizzle/schema";
import { PlayerSeasonSchema, RegisterSchema } from "@/lib/schemas/auth";
import { SectionSchema } from "@/lib/schemas/player";
import { defineAction } from "astro:actions";
import { ActionError } from "astro:actions";
import { UserDetailsTable, UsersTable } from "@/drizzle/schema";
import { MatchmakeSchema, MatchResultSchema } from "@/lib/schemas/match";
import {
	and,
	asc,
	desc,
	eq,
	inArray,
	notInArray,
} from "drizzle-orm";
import { matchmake } from "@/lib/server/admin/matchmake";
import { updateRating } from "@/lib/server/admin/score";
import type { PlayerScore } from "@/lib/types/player";
import { getPersistedPairs, getPersistedPlayers } from "@/lib/server/power-cards";

// TODO: Rollback transactions on error

export const server = {
	register: defineAction({
		input: RegisterSchema,
		handler: async (data) => {
			console.log("Register:", data);

			const { email, password, confirmPassword, birthDate, ...userDetails } =
				data;

			if (password !== confirmPassword) {
				throw new ActionError({
					code: "BAD_REQUEST",
					message: "Passwords don't match.",
				});
			}

			await db.transaction(async (tx) => {
				const [user] = await tx
					.insert(UsersTable)
					.values({ email, password })
					.returning({ userId: UsersTable.userId });

				await tx.insert(UserDetailsTable).values({
					userId: user.userId,
					birthDate: birthDate.toDateString(),
					...userDetails,
				});

				// TODO: Only players have power cards

				const powerCards = await tx
					.select({ powerCardId: PowerCardsTable.powerCardId })
					.from(PowerCardsTable);

				for (const powerCard of powerCards) {
					await tx.insert(PlayerPowerCardsTable).values({
						powerCardId: powerCard.powerCardId,
						userId: user.userId,
					});
				}
			});

			console.log("Successfully registered:", email);
		},
	}),
	playerSeasonRegister: defineAction({
		input: PlayerSeasonSchema,
		handler: async (data) => {
			await db.transaction(async (tx) => {
				const [latestSeason] = await tx
					.select({ arnisSeasonId: ArnisSeasonsTable.arnisSeasonId })
					.from(ArnisSeasonsTable)
					.where(eq(ArnisSeasonsTable.status, "ongoing"))
					.orderBy(desc(ArnisSeasonsTable.createdAt))
					.limit(1);

				await tx
					.insert(PlayerSeasonDetailsTable)
					.values({ arnisSeasonId: latestSeason.arnisSeasonId, ...data });
			});

			console.log("Successfully entered the new season.");
		},
	}),
	sections: defineAction({
		input: SectionSchema,
		handler: async (data) => {
			await db.insert(SectionsTable).values(data);
		},
	}),
	matchmake: defineAction({
		input: MatchmakeSchema,
		handler: async (data) => {
			console.log("Matchmaking...");

			await db.transaction(async (tx) => {
				const persistedPlayers = await getPersistedPlayers(tx);

				const players = await tx
					.select({
						userId: PlayerSeasonDetailsTable.userId,
						rating: PlayerSeasonDetailsTable.rating,
					})
					.from(PlayerSeasonDetailsTable)
					.where(
						and(
							eq(PlayerSeasonDetailsTable.sectionId, data.sectionId),
							eq(PlayerSeasonDetailsTable.arnisSeasonId, data.arnisSeasonId),
							notInArray(
								PlayerSeasonDetailsTable.userId,
								persistedPlayers.map((player) => player.userId),
							),
						),
					)
					.orderBy(asc(PlayerSeasonDetailsTable.rating));

				const matches = matchmake(players);
				const persistedPairs = getPersistedPairs(persistedPlayers);

				matches.push(...persistedPairs);

				console.log("Matches:", matches);

				for (const pairs of matches) {
					const [match] = await tx
						.insert(MatchesTable)
						.values({ cardBattleDuration: "6 hours" })
						.returning({ matchId: MatchesTable.matchId });

					await tx.insert(MatchArnisTechniquesTable).values({
						matchId: match.matchId,
						arnisTechniqueId: data.arnisTechniqueId,
					});

					for (const player of pairs) {
						await tx
							.insert(MatchPlayersTable)
							.values({ matchId: match.matchId, userId: player.userId });
					}
				}

				await tx
					.update(PlayerPowerCardsTable)
					.set({ status: "activated" })
					.where(
						and(
							eq(PlayerPowerCardsTable.status, "active"),
							eq(PlayerPowerCardsTable.powerCardId, 4),
							inArray(
								PlayerPowerCardsTable.userId,
								persistedPlayers.map((player) => player.userId),
							),
						),
					);
			});

			console.log("Successful matchmaking.");
		},
	}),
	matchResult: defineAction({
		input: MatchResultSchema,
		handler: async (data) => {
			let playerScores: PlayerScore[] = [];
			let scoreDiff = 0;

			await db.transaction(async (tx) => {
				await tx.insert(MatchCommentsTable).values({
					matchId: data.matchId,
					userId: data.comment.userId,
					content: data.comment.content,
				});

				for (const result of data.results) {
					let currentScore = 0;

					for (const { score, rubricId } of result.rubricScores) {
						await tx.insert(MatchPlayerScoresTable).values({
							score,
							rubricId: rubricId,
							matchPlayerId: result.matchPlayerId,
						});

						currentScore += score;
					}

					if (scoreDiff === 0) {
						scoreDiff += currentScore;
					} else {
						scoreDiff -= currentScore;
					}

					playerScores.push({
						userId: result.userId,
						score: currentScore,
					});
				}

				console.log("Score Diff:", scoreDiff);

				// Players have the same score (draw)
				if (scoreDiff === 0) {
					console.log("The match was a draw!");
					return;
				}

				const winner = scoreDiff > 0 ? playerScores[0] : playerScores[1];
				const loser = scoreDiff > 0 ? playerScores[1] : playerScores[0];

				await updateRating(tx, data.arnisSeasonId, winner, Math.abs(scoreDiff));
				await updateRating(
					tx,
					data.arnisSeasonId,
					loser,
					Math.abs(scoreDiff) * -1,
				);

				await tx
					.update(MatchesTable)
					.set({ finishedAt: new Date() })
					.where(eq(MatchesTable.matchId, data.matchId));

				// TODO: Add badges?
			});

			console.log("Success!");
		},
	}),
};
