import type { Player } from "@/types/player";
import { matchmake } from "./matchmake";

const players: Player[] = [
  {
    rating: 85,
    user_id: "foo",
  },
  {
    rating: 105,
    user_id: "bar",
  },
  {
    rating: 125,
    user_id: "baz",
  },
  {
    rating: 127,
    user_id: "e",
  },
  {
    rating: 130,
    user_id: "f",
  },
  {
    rating: 59,
    user_id: "a",
  },
  {
    rating: 80,
    user_id: "b",
  },
  {
    rating: 97,
    user_id: "c",
  },
  {
    rating: 100,
    user_id: "d",
  },
];

const matches = matchmake(players);

console.log("Matches:", matches);
