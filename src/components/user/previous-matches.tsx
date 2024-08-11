import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreviousMatchResponseData } from "@/types/schemas/match";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  matches: PreviousMatchResponseData[];
};

export default function Component(props: Props): JSX.Element {
  console.log("Previous Match:", props.matches);

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
                  className="border-none odd:bg-card/75 even:bg-background-2/75"
                  key={match.matchId}
                >
                  <TableCell className="pl-6">
                    <div className="flex gap-2 items-center">
                      <Avatar>
                        <AvatarImage
                          src={match.opponent.avatarUrl ?? undefined}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-jost-medium">{opponentName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6">
                    <p className="text-lg font-jost-medium">
                      {match.arnisTechnique.name}
                    </p>
                    <p className="text-muted-foreground first-letter:capitalize">
                      {match.arnisTechnique.techniqueType}
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
