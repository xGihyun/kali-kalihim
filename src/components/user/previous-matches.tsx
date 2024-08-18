import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Verdict, type PreviousMatchResponseData } from "@/types/schemas/match";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  matches: PreviousMatchResponseData[];
};

export default function Component(props: Props): JSX.Element {
  console.log("Previous Match:", props.matches);
  console.log("Techniques", props.matches[0].arnisTechniques);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previous Matches</CardTitle>
      </CardHeader>
      <CardContent className="px-0 bg-background pb-0">
        <Table className="border-spacing-y-1 border-separate">
          <TableBody>
            {props.matches.map((match) => {
              const opponentName = `${match.opponent.firstName} ${match.opponent.lastName}`;
              const initials =
                `${match.opponent.firstName[0]}${match.opponent.lastName[0]}`.toUpperCase();

              return (
                <TableRow
                  className="border-none odd:bg-card/75 even:bg-background-2/75 relative"
                  key={match.matchId}
                >
                  <TableCell className="pl-6 relative">
                    <div className="flex gap-2 items-center relative z-20">
                      <Avatar className="shadow">
                        <AvatarImage
                          src={match.opponent.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-jost-medium">{opponentName}</p>
                    </div>

                    <VerdictHighlight match={match} />
                  </TableCell>
                  <TableCell className="pr-6">
                    <p className="text-lg font-jost-medium">
                      {match.arnisTechniques[0].name}
                    </p>
                    <p className="text-muted-foreground first-letter:capitalize">
                      {match.arnisTechniques[0].techniqueType}
                    </p>
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

type VerdictHightlightProps = {
  match: PreviousMatchResponseData;
};

function VerdictHighlight(props: VerdictHightlightProps): JSX.Element {
  let color = "";

  switch (props.match.verdict) {
    case Verdict.Victory:
      color = "border-l-success from-success/25";
      break;
    case Verdict.Defeat:
      color = "border-l-destructive from-destructive/25";
      break;
    default:
      color = "border-l-primary from-primary/25";
  }

  return (
    <div
      className={`absolute left-0 top-0 w-16 bg-gradient-to-r border-l-4 h-full z-10 ${color}`}
    />
  );
}
