import type { PlayerRating } from "@/lib/types/player";
import { matchmake } from "./matchmake";
import { expect, test } from "vitest";

const players: PlayerRating[] = [
  {
    rating: 85,
    userId: "75b1134f-602e-4ece-9d7d-ccfea212aa04",
  },
  {
    rating: 105,
    userId: "600bcb1e-d1b7-4f84-b25d-e8f37a654b0a",
  },
  {
    rating: 125,
    userId: "3ba967c6-dac4-41d0-ac1a-6316229bc019",
  },
  {
    rating: 127,
    userId: "f8c3cac9-61ae-4deb-a601-02b9231eab90",
  },
  {
    rating: 130,
    userId: "d1d3265b-050b-425d-b4a6-a2225d6eb07e",
  },
  {
    rating: 59,
    userId: "3b14b23b-6c6c-489c-9bdc-7a388b473aa7",
  },
  {
    rating: 80,
    userId: "1da3f41a-c9f7-4539-84de-87fb6fa3194a",
  },
];

test("matchmaking has correct structure", () => {
  const result = matchmake(players);

  for (const pair of result) {
    expect(pair.length).toBe(2);
  }
});

test("matchmaking doesn't pair players with themselves", () => {
  const result = matchmake(players);

  expect(result.every((pair) => Array.isArray(pair) && pair.length === 2)).toBe(
    true,
  );
});

test("matchmaking handles odd number of players", () => {
  const result = matchmake(players);

  expect(result).toHaveLength(3);
});
