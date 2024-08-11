import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UpcomingMatchResponseData } from "@/types/schemas/match";

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
      <CardContent>
        <p>
          {props.match === null
            ? "No Opponent"
            : props.match.opponent.firstName}
        </p>
      </CardContent>
    </Card>
  );
}
