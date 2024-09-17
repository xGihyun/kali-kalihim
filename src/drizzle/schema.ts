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
  unique,
} from "drizzle-orm/pg-core";

/*
 * Enums
 */

export const roleEnum = pgEnum("role", ["player", "admin"]);
export const sexEnum = pgEnum("sex", ["male", "female"]);

// NOTE: Might convert this to a separate table if more technique types are added
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

// Users

export const UsersTable = pgTable("users", {
  id: uuid("user_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("player"),
});

export const UserDetailsTable = pgTable("user_details", {
  id: uuid("user_detail_id").primaryKey().defaultRandom(),

  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  sex: sexEnum("sex").notNull(),
  birthDate: date("birth_date").notNull(),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),

  userId: uuid("user_id")
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

// Auth

export const UserSessionsTable = pgTable("user_sessions", {
  id: text("user_session_id").primaryKey(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),

  userId: uuid("user_id")
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull()
});

// Player only

export const SectionsTable = pgTable("sections", {
  id: uuid("section_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  name: text("name").notNull(),
  limit: smallint("limit").notNull(),
});

export const ArnisSeasonsTable = pgTable("arnis_seasons", {
  id: smallserial("arnis_season_id").primaryKey(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  status: arnisSeasonStatusEnum("status").notNull().default("upcoming"),
  start: date("start").notNull(),
  end: date("end").notNull(),
});

export const PlayerSeasonDetailsTable = pgTable(
  "player_season_details",
  {
    id: uuid("player_season_detail_id").primaryKey().defaultRandom(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),

    rating: smallint("rating").notNull().default(0),

    userId: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    sectionId: uuid("section_id")
      .references(() => SectionsTable.id)
      .notNull(),
    arnisSeasonId: smallserial("arnis_season_id")
      .references(() => ArnisSeasonsTable.id)
      .notNull(),
  },
  (table) => {
    return {
      unique_user_season: unique("unique_player_season").on(
        table.userId,
        table.arnisSeasonId,
      ),
    };
  },
);

// Power Cards

export const PowerCardsTable = pgTable("power_cards", {
  id: smallserial("power_card_id").primaryKey(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  name: text("name").notNull(),
  // Lower-cased `name`
  // Can't be set as PK since it's dependent on the `name`.
  // If the name changes, this has to be updated too. This can't be done on PKs
  identifier: text("identifier").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const PlayerPowerCardsTable = pgTable("player_power_cards", {
  id: uuid("player_power_card_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  status: powerCardStatusEnum("status").notNull().default("inactive"),

  powerCardId: smallserial("power_card_id")
    .references(() => PowerCardsTable.id)
    .notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
});

// Matches

export const MatchesTable = pgTable("matches", {
  id: uuid("match_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  cardBattleDuration: interval("card_battle_duration", {
    fields: "hour",
  }).notNull(),
  finishedAt: timestamp("finished_at"),

  //status: matchStatusEnum("status").notNull().default("pending"),
});

export const MatchCommentsTable = pgTable("match_comments", {
  id: uuid("match_comment_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  content: text("content"),

  // The admin who commented
  userId: uuid("user_id")
    .notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  matchId: uuid("match_id")
    .references(() => MatchesTable.id)
    .notNull(),
});

export const ArnisTechniquesTable = pgTable("arnis_techniques", {
  id: smallserial("arnis_technique_id").primaryKey(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull(),
  techniqueType: arnisTechniqueTypeEnum("technique_type").notNull(),
  videoUrl: text("video_url"),
});

export const MatchArnisTechniquesTable = pgTable("match_arnis_techniques", {
  id: uuid("match_arnis_technique_id").primaryKey().defaultRandom(),

  matchId: uuid("match_id")
    .references(() => MatchesTable.id)
    .notNull(),
  arnisTechniqueId: smallserial("arnis_technique_id")
    .references(() => ArnisTechniquesTable.id)
    .notNull(),
});

export const RubricsTable = pgTable("rubrics", {
  id: smallserial("rubric_id").primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  maxScore: smallint("max_score").notNull(),

  // `active` - The rubric will be used in scoring
  // `inactive` - The rubric will NOT be used in scoring
  status: rubricStatusEnum("status").notNull().default("active"),
});

export const MatchPlayersTable = pgTable("match_players", {
  id: uuid("match_player_id").primaryKey().defaultRandom(),

  matchId: uuid("match_id")
    .references(() => MatchesTable.id)
    .notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
});

export const MatchPlayerScoresTable = pgTable("match_player_scores", {
  id: uuid("match_player_score_id").primaryKey().defaultRandom(),

  score: smallint("score").notNull(),

  matchPlayerId: uuid("match_player_id")
    .references(() => MatchPlayersTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  rubricId: smallserial("rubric_id")
    .references(() => RubricsTable.id)
    .notNull(),
});

// Card Battle

export const ArnisCardsTable = pgTable("arnis_cards", {
  id: smallserial("arnis_card_id").primaryKey(),

  name: text("name").notNull(),
  cardType: arnisCardTypeEnum("card_type").notNull(),
});

export const ArnisCardStatsTable = pgTable("arnis_card_stats", {
  id: smallserial("arnis_card_stat_id").primaryKey(),

  name: text("name").notNull(),
  amount: decimal("amount", { scale: 5, precision: 2 }).notNull(),

  arnisCardId: smallserial("arnis_card_id")
    .references(() => ArnisCardsTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const ArnisCardEffectsTable = pgTable("arnis_card_effects", {
  id: smallserial("arnis_card_effect_id").primaryKey(),

  amount: decimal("amount", { scale: 5, precision: 2 }).notNull(),
  target: arnisCardEffectTargetEnum("target").notNull(),

  arnisCardStatId: smallserial("arnis_card_stat_id")
    .references(() => ArnisCardStatsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const ArnisCardBattleTable = pgTable("arnis_card_battles", {
  id: uuid("arnis_card_battle_id").primaryKey().defaultRandom(),

  status: arnisCardBattleStatusEnum("status"),
  damage: decimal("damage", { scale: 5, precision: 2 }),

  arnisCardId: smallserial("arnis_card_id")
    .notNull()
    .references(() => ArnisCardsTable.id),
  userId: uuid("user_id")
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),
  matchId: uuid("match_id")
    .references(() => MatchesTable.id)
    .notNull(),
});

// Badges

export const BadgesTable = pgTable("badges", {
  id: smallserial("badge_id").primaryKey(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const PlayerBadgesTable = pgTable("player_badges", {
  id: uuid("player_badge_id").primaryKey().defaultRandom(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),

  userId: uuid("user_id")
    .references(() => UsersTable.id, { onDelete: "cascade" })
    .notNull(),
  badgeId: smallserial("badge_id")
    .references(() => BadgesTable.id)
    .notNull(),
});
