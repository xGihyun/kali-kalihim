import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerPowerCard } from "@/types/schemas/player";

type Props = {
  powerCards: PlayerPowerCard[];
};

// TODO: Load images

export default function Component(props: Props): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Power Cards</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-2">
        {props.powerCards.map((powerCard) => (
          <div className="w-full h-60">{powerCard.name}</div>
        ))}
      </CardContent>
    </Card>
  );
}
