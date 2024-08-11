import type { PlayerLeaderboard } from "@/types/player";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  players: PlayerLeaderboard[];
};

export default function Component(props: Props): JSX.Element {
  return (
    <Card >
      <CardHeader >
        <CardTitle>Top Players</CardTitle>
        <CardDescription>Top players for the current season</CardDescription>
      </CardHeader>
      <CardContent className="px-0 bg-background pb-0">
        <Table className="border-spacing-y-1 border-separate">
          <TableBody>
            {props.players.map((player, i) => {
              const name = `${player.firstName} ${player.lastName}`;

              return (
                <TableRow
                  className="border-none odd:bg-card/75 even:bg-background-2/75"
                  key={player.userId}
                >
                  <TableCell className="pl-6 max-w-min text-lg">
                    #{i + 1}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/users/${player.userId}`}
                      className="text-lg hover:underline max-w-fit block font-jost-medium text-primary"
                    >
                      {name}
                    </a>
                    <span className="text-sm text-muted-foreground">
                      St. {player.sectionName}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-lg font-jost-medium">
                    {player.rating} pts.
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
