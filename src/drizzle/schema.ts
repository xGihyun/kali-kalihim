import {
	date,
	pgEnum,
	pgTable,
	smallint,
	text,
	timestamp,
	uuid,
	smallserial,
	interval,
	decimal,
} from "drizzle-orm/pg-core";

/*
 * Enums
 */

export const roleEnum = pgEnum("role", ["player", "admin"]);
export const sexEnum = pgEnum("sex", ["male", "female"]);
export const arnisTechniqueTypeEnum = pgEnum("arnis_technique_type", [
	"skill",
	"footwork",
]);
export const arnisSeasonStatusEnum = pgEnum("arnis_season_status", [
	"upcoming",
	"ongoing",
	"done",
]);
export const powerCardStatusEnum = pgEnum("power_card_status", [
	"inactive",
	"active",
	"activated",
]);
export const matchStatusEnum = pgEnum("match_status", ["pending", "done"]);
export const arnisCardTypeEnum = pgEnum("arnis_card_type", ["strike", "block"]);
//export const arnisCardEffectActionEnum = pgEnum("arnis_card_effect_action", ["increase", "decrease"]);
export const arnisCardEffectTargetEnum = pgEnum("arnis_card_effect_target", [
	"self",
	"opponent",
]);
export const arnisCardBattleStatusEnum = pgEnum("arnis_card_battle_status", [
	"hit",
	"missed",
	"blocked",
]);
export const rubricStatusEnum = pgEnum("rubric_status", ["inactive", "active"]);

/*
 * Tables
 */

export const UsersTable = pgTable("users", {
	user_id: uuid("user_id").primaryKey().defaultRandom(),

	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	role: roleEnum("role").notNull().default("player"),
});

export const UserDetailsTable = pgTable("user_details", {
	user_detail_id: uuid("user_detail_id").primaryKey().defaultRandom(),

	first_name: text("first_name").notNull(),
	middle_name: text("middle_name"),
	last_name: text("last_name").notNull(),
	sex: sexEnum("sex").notNull(),
	birth_date: date("birth_date").notNull(),
	avatar_url: text("avatar_url"),
	banner_url: text("banner_url"),

	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull()
		.unique(),
});

// Player only

export const SectionsTable = pgTable("sections", {
	section_id: uuid("section_id").primaryKey().defaultRandom(),

	name: text("name").notNull(),
	limit: smallint("limit").notNull(),
});

export const ArnisSeasonsTable = pgTable("arnis_seasons", {
	arnis_season_id: smallserial("arnis_season_id").primaryKey(),

	status: arnisSeasonStatusEnum("status").notNull().default("upcoming"),
	start: date("start").notNull(),
	end: date("end").notNull(),
});

export const PlayerSeasonDetailsTable = pgTable("player_season_details", {
	player_season_detail_id: uuid("player_season_detail_id")
		.primaryKey()
		.defaultRandom(),

	rating: smallint("rating").notNull().default(0),

	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
	section_id: uuid("section_id")
		.references(() => SectionsTable.section_id)
		.notNull(),
	arnis_season_id: smallserial("arnis_season_id")
		.references(() => ArnisSeasonsTable.arnis_season_id)
		.notNull(),
});

// Power Cards

export const PowerCardsTable = pgTable("power_cards", {
	power_card_id: smallserial("power_card_id").primaryKey(),

	name: text("name").notNull(),
	description: text("description").notNull(),
	image_url: text("image_url"),
});

export const PlayerPowerCardsTable = pgTable("player_power_cards", {
	player_power_card_id: uuid("player_power_card_id")
		.primaryKey()
		.defaultRandom(),

	status: powerCardStatusEnum("status").notNull().default("inactive"),

	power_card_id: smallserial("power_card_id")
		.references(() => PowerCardsTable.power_card_id)
		.notNull(),
	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
});

// Matches

export const MatchesTable = pgTable("matches", {
	match_id: uuid("match_id").primaryKey().defaultRandom(),

	created_at: timestamp("created_at").notNull().defaultNow(),
	card_battle_duration: interval("card_battle_duration", {
		fields: "hour",
	}).notNull(),
	status: matchStatusEnum("status").notNull().default("pending"),
});

export const MatchCommentsTable = pgTable("match_comments", {
	match_comment_id: uuid("match_comment_id").primaryKey().defaultRandom(),

	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	content: text("content"),

	// The admin who commented
	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
	match_id: uuid("match_id")
		.references(() => MatchesTable.match_id)
		.notNull(),
});

export const ArnisTechniquesTable = pgTable("arnis_techniques", {
	arnis_technique_id: smallserial("arnis_technique_id").primaryKey(),

	name: text("name").notNull(),
	technique_type: arnisTechniqueTypeEnum("technique_type").notNull(),
	video_url: text("video_url"),
});

export const MatchArnisTechniquesTable = pgTable("match_arnis_techniques", {
	match_arnis_technique_id: uuid("match_arnis_technique_id")
		.primaryKey()
		.defaultRandom(),

	match_id: uuid("match_id")
		.references(() => MatchesTable.match_id)
		.notNull(),
	arnis_technique_id: smallserial("arnis_technique_id")
		.references(() => ArnisTechniquesTable.arnis_technique_id)
		.notNull(),
});

export const RubricsTable = pgTable("rubrics", {
	rubric_id: smallserial("rubric_id").primaryKey(),

	name: text("name").notNull(),
	description: text("description"),
	max_score: smallint("max_score").notNull(),

	// `active` - The rubric will be used in scoring
	// `inactive` - The rubric will NOT be used in scoring
	status: rubricStatusEnum("status").notNull().default("active"),
});

export const PlayerMatchesTable = pgTable("player_matches", {
	player_match_id: uuid("player_match_id").primaryKey().defaultRandom(),

	match_id: uuid("match_id")
		.references(() => MatchesTable.match_id)
		.notNull(),
	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
});

export const PlayerMatchScoresTable = pgTable("player_match_scores", {
	player_match_score_id: uuid("player_match_score_id")
		.primaryKey()
		.defaultRandom(),

	score: smallint("score").notNull(),

	player_match_id: uuid("player_match_id")
		.references(() => PlayerMatchesTable.player_match_id)
		.notNull(),
	rubric_id: smallserial("rubric_id")
		.references(() => RubricsTable.rubric_id)
		.notNull(),
});

// Card Battle

export const ArnisCardsTable = pgTable("arnis_cards", {
	arnis_card_id: smallserial("arnis_card_id").primaryKey(),

	name: text("name").notNull(),
	card_type: arnisCardTypeEnum("card_type").notNull(),
});

export const ArnisCardStatsTable = pgTable("arnis_card_stats", {
	arnis_card_stat_id: smallserial("arnis_card_stat_id").primaryKey(),

	name: text("name").notNull(),
	amount: decimal("amount", { scale: 5, precision: 2 }).notNull(),

	arnis_card_id: smallserial("arnis_card_id")
		.references(() => ArnisCardsTable.arnis_card_id)
		.notNull()
		.unique(),
});

export const ArnisCardEffectsTable = pgTable("arnis_card_effects", {
	arnis_card_effect_id: smallserial("arnis_card_effect_id").primaryKey(),

	amount: decimal("amount", { scale: 5, precision: 2 }).notNull(),
	target: arnisCardEffectTargetEnum("target").notNull(),

	arnis_card_stat_id: smallserial("arnis_card_stat_id")
		.references(() => ArnisCardStatsTable.arnis_card_stat_id)
		.notNull(),
});

export const ArnisCardBattleTable = pgTable("arnis_card_battles", {
	arnis_card_battle_id: uuid("arnis_card_battle_id")
		.primaryKey()
		.defaultRandom(),

	status: arnisCardBattleStatusEnum("status"),
	damage: decimal("damage", { scale: 5, precision: 2 }),

	arnis_card_id: smallserial("arnis_card_id")
		.notNull()
		.references(() => ArnisCardsTable.arnis_card_id),
	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
	match_id: uuid("match_id")
		.references(() => MatchesTable.match_id)
		.notNull(),
});

// Badges

export const BadgesTable = pgTable("badges", {
	badge_id: smallserial("badge_id").primaryKey(),

	name: text("name").notNull(),
	description: text("description").notNull(),
});

export const PlayerBadgesTable = pgTable("player_badges", {
	player_badge_id: uuid("player_badge_id").primaryKey().defaultRandom(),

	user_id: uuid("user_id")
		.references(() => UsersTable.user_id)
		.notNull(),
	badge_id: uuid("badge_id")
		.references(() => BadgesTable.badge_id)
		.notNull(),
});
