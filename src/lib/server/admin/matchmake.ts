import type { Player, PlayerRating } from "@/lib/types/player";

export function matchmake(
	players: PlayerRating[],
	bucketSize: number = 40,
): Player[][] {
	const buckets: Map<number, Player[]> = new Map([]);

	players.sort((a, b) => a.rating - b.rating);

	for (const player of players) {
		const bucket = Math.floor(player.rating / bucketSize);

		if (buckets.has(bucket)) {
			buckets.get(bucket)?.push({ userId: player.userId });
			continue;
		}

		buckets.set(bucket, [{ userId: player.userId }]);
	}

	const matches: Player[][] = [];
	let unmatchedPlayer: Player | null = null;

	for (const bucket of buckets.values()) {
		if (unmatchedPlayer !== null) {
			//console.log("Push unmatched:", unmatchedPlayer);

			bucket.push(unmatchedPlayer);
			unmatchedPlayer = null;
		}

		shuffle(bucket);

		while (bucket.length > 1) {
			const p1 = bucket.pop()!;
			const p2 = bucket.pop()!;

			matches.push([p1, p2]);
		}

		if (bucket.length % 2 === 0) {
			continue;
		}

		if (unmatchedPlayer === null) {
			unmatchedPlayer = bucket.pop()!;
			//console.log("Unmatched:", unmatchedPlayer);
			continue;
		}

		//console.log("Matching unmatched:", unmatchedPlayer);

		const filteredBucket = bucket.filter(
			(player) => player.userId !== unmatchedPlayer?.userId,
		);
		const match = [unmatchedPlayer, filteredBucket.pop()!];

		matches.push(match);
		unmatchedPlayer = null;
	}

	return matches;
}

// Durstenfeld's Shuffle
function shuffle<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}
