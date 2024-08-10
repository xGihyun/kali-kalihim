import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MatchRowData } from "@/types/schemas/match";
import { format } from "date-fns";

type Props = {
  matches: MatchRowData[];
};

export default function Component(props: Props): JSX.Element {
  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent className="px-0 bg-background pb-0">
        <Table className="border-spacing-y-1 border-separate">
          <TableHeader>
            <TableRow className="pointer-events-none">
              <TableHead className="pl-6">Players</TableHead>
              <TableHead>Scores</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead className="pr-6 text-right">Date</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {props.matches.map((match) => {
              return (
                <TableRow
                  className="border-none odd:bg-card/75 even:bg-background-2/75"
                  key={match.matchId}
                >
                  <TableCell className="pl-6 max-w-min text-lg">
                    {match.players.map((player) => {
                      const name = `${player.firstName} ${player.lastName}`;

                      return (
                        <a
                          href={`/users/${player.userId}`}
                          className="text-lg hover:underline max-w-fit block"
                          key={player.userId}
                        >
                          {name}
                        </a>
                      );
                    })}
                  </TableCell>
                  <TableCell className="text-lg">
                    {match.players.map((player) => (
                      <p key={player.userId}>{player.score}</p>
                    ))}
                  </TableCell>
                  <TableCell className="text-lg">
                    {match.arnisTechniques[0].name}
                  </TableCell>
                  <TableCell className="pr-6 text-lg text-right">
                    {format(match.finishedAt, 'MMMM d, yyyy - hh:mm a')}
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
