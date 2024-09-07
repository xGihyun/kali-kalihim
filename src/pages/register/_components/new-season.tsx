import { PlayerSeasonSchema, type PlayerSeasonInput } from "@/lib/schemas/auth";
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
import type { SectionModel } from "@/lib/types/player";

type Props = {
  sections: SectionModel[];
};

export default function Component({ sections }: Props): JSX.Element {
  const form = useForm<PlayerSeasonInput>({
    resolver: zodResolver(PlayerSeasonSchema),
    defaultValues: {
      userId: "",
      sectionId: "",
    },
  });

  async function onSubmit(values: PlayerSeasonInput) {
    const toastId = toast.loading("Submitting...");
    console.log("Values:", values);

    const { error } = await actions.playerSeasonRegister(values);

    if (error) {
      console.error("ERROR:", error);
      toast.error(error.message, {
        id: toastId,
        duration: Number.POSITIVE_INFINITY,
      });
      return;
    }

    toast.success("Successfully registered.", { id: toastId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User ID (REMOVE LATER)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {sections.map((section) => (
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
