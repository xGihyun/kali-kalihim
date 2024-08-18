import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingMatchResponseData } from "@/types/schemas/match";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  match: UpcomingMatchResponseData | null;
};

export default function Component(props: Props): JSX.Element {
  console.log("Upcoming Match:", props.match);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Match</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {props.match ? (
          <Match match={props.match} />
        ) : (
          <p className="text-muted-foreground italic p-6">No Opponent</p>
        )}
      </CardContent>
    </Card>
  );
}

type MatchProps = {
  match: UpcomingMatchResponseData;
};

function Match(props: MatchProps): JSX.Element {
  const opponentName = `${props.match.opponent.firstName} ${props.match.opponent.lastName}`;
  const initials =
    `${props.match.opponent.firstName[0]}${props.match.opponent.lastName[0]}`.toUpperCase();

  return (
    <div className="flex items-center">
      <div className="pl-6 p-2 w-full">
        <div className="flex gap-2 items-center relative z-20">
          <Avatar className="shadow">
            <AvatarImage src={props.match.opponent.avatarUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <p className="text-lg font-jost-medium">{opponentName}</p>
        </div>
      </div>

      <div className="pr-6 p-2 w-full">
        <p className="text-lg font-jost-medium">
          {props.match.arnisTechniques[0].name}
        </p>
        <p className="text-muted-foreground first-letter:capitalize">
          {props.match.arnisTechniques[0].techniqueType}
        </p>
      </div>
    </div>
  );
}
