import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreviousMatch, UpcomingMatch } from "@/types/schemas/match";

type Match = {
  upcoming: UpcomingMatch | null;
  previous: PreviousMatch[];
};

type Props = {
  match: Match;
};

export default function Component(props: Props): JSX.Element {

  console.log("Match:", props.match)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Match</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{props.match.upcoming === null ? "No Opponent" : props.match.upcoming.opponent.firstName}</p>
      </CardContent>
    </Card>
  );
}
