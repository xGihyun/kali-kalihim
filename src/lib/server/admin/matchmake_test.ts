import type { PlayerRating } from "@/lib/types/player";
import { matchmake } from "./matchmake";

const players: PlayerRating[] = [
  {
    rating: 85,
    userId: "foo",
  },
  {
    rating: 105,
    userId: "bar",
  },
  {
    rating: 125,
    userId: "baz",
  },
  {
    rating: 127,
    userId: "e",
  },
  {
    rating: 130,
    userId: "f",
  },
  {
    rating: 59,
    userId: "a",
  },
  {
    rating: 80,
    userId: "b",
  },
  {
    rating: 97,
    userId: "c",
  },
  {
    rating: 100,
    userId: "d",
  },
];

const matches = matchmake(players);

console.log("Matches:", matches);
