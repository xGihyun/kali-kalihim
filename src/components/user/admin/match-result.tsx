import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { actions } from "astro:actions";
import { type MatchPlayer, type RubricModel } from "@/lib/types/match";
import { MatchResultSchema, type MatchResultInput } from "@/lib/schemas/match";

type Props = {
  players: MatchPlayer[];
  matchId: string;
  rubrics: RubricModel[];
  arnisSeasonId: number;
};

export default function MatchResult(props: Props): JSX.Element {
  const form = useForm<MatchResultInput>({
    resolver: zodResolver(MatchResultSchema),
    defaultValues: {
      comment: {
        // TODO: Set to current admin ID
        userId: "1fb8f1e8-9bc8-471f-bfab-9d7d3acb571d",
        content: "",
      },
      matchId: props.matchId,
      arnisSeasonId: props.arnisSeasonId,
      results: props.players.map((player) => ({
        userId: player.userId,
        matchPlayerId: player.matchPlayerId,
        rubricScores: props.rubrics.map((rubric) => ({
          rubricId: rubric.rubricId,
          score: 0,
        })),
      })),
    },
  });

  async function onSubmit(values: MatchResultInput) {
    const toastId = toast.loading("Submitting...");

    console.log("Values:", values);
    const { error } = await actions.matchResult(values);

    if (error) {
      console.error("ERROR:", error);
      toast.error(error.message, {
        id: toastId,
        duration: 60000,
      });
      return;
    }

    toast.success("Successfully submitted scores.", { id: toastId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="comment.content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Input placeholder="Add a comment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {props.players.map((player, playerIdx) => (
          <div key={player.matchPlayerId}>
            <h3 className="text-lg font-jost-semibold">{player.firstName}</h3>

            {props.rubrics.map((rubric, rubricIdx) => (
              <FormField
                key={rubric.rubricId}
                control={form.control}
                name={`results.${playerIdx}.rubricScores.${rubricIdx}.score`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{rubric.name}</FormLabel>
                    <FormControl>
                      <Input type="number" max={rubric.maxScore} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        ))}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
