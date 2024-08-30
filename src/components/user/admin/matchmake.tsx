import { MatchmakeSchema, type MatchmakeInput } from "@/lib/schemas/match";
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
import { actions } from "astro:actions";
import type {
  ArnisSeasonModel,
  ArnisTechniqueModel,
} from "@/lib/types/arnis";
import type { SectionModel } from "@/lib/types/player";

type Props = {
  arnisTechniques: Omit<ArnisTechniqueModel, "video_url">[];
  sections: SectionModel[];
  arnisSeasons: ArnisSeasonModel[];
};

export default function Matchmake(props: Props): JSX.Element {
  const form = useForm<MatchmakeInput>({
    resolver: zodResolver(MatchmakeSchema),
    defaultValues: {
      sectionId: "",
    },
  });

  async function onSubmit(values: MatchmakeInput) {
    const toastId = toast.loading("Matchmaking...");
    console.log("Values:", values);

    const { error } = await actions.matchmake(values);

    if (error) {
      console.error("ERROR:", error);
      toast.error(error.message, {
        id: toastId,
        duration: Number.POSITIVE_INFINITY,
      });
      return;
    }

    toast.success("Successful matchmaking.", { id: toastId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.sections.map((section) => (
                    <SelectItem
                      value={section.sectionId}
                      key={section.sectionId}
                    >
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arnisSeasonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a season" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.arnisSeasons.map((season) => (
                    <SelectItem
                      value={season.arnisSeasonId.toString()}
                      key={season.arnisSeasonId}
                    >
                      {season.start}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="arnisTechniqueId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technique</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a technique" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {props.arnisTechniques.map((technique) => (
                    <SelectItem
                      value={technique.arnisTechniqueId.toString()}
                      key={technique.arnisTechniqueId}
                    >
                      {technique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
