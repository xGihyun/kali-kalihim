import type { PlayerLeaderboard } from "@/types/player";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  players: PlayerLeaderboard[];
};

export default function Component(props: Props): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Players</CardTitle>
        <CardDescription>Top players on the current season</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody className="">
            {props.players.map((player, i) => {
              const name = `${player.firstName} ${player.lastName}`;

              return (
                <TableRow>
                  <TableCell>
                    #{i + 1} {name}
                  </TableCell>
                  <TableCell>{player.rating}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
