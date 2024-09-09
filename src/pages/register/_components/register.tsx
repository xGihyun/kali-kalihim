import { RegisterSchema, type RegisterInput } from "@/lib/schemas/auth";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { IconCalendar } from "@/lib/icons";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $signUpStore } from "@clerk/astro/client";
import Verify from "./verify";
import type { SignUpResource } from "@clerk/types";
import { errAsync, fromPromise, okAsync, type ResultAsync } from "neverthrow";
import { AppError } from "@/lib/types/error";

export default function Component(): JSX.Element {
  const signUp = useStore($signUpStore);
  const [verifying, setVerifying] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterInput>();

  // TODO: I might not need this anymore
  const [error, setError] = useState<AppError | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      middleName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInput): Promise<void> {
    setError(null);
    const toastId = toast.loading("Submitting...");

    console.log("Register values:", values);

    const result = handleSignUp(values, signUp).andThen((res) =>
      prepareVerification(res),
    );

    return result.match(
      () => {
        setRegisterData(values);
        setVerifying(true);

        toast.info("Please verify your account.", { id: toastId });
      },
      (err) => {
        setError(err);
        console.error(JSON.stringify(err, null, 2));

        toast.error(err.message, {
          id: toastId,
          duration: Number.POSITIVE_INFINITY,
        });
      },
    );
  }

  if (verifying && registerData && error === null) {
    return <Verify registerData={registerData} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="hello@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value === null ? undefined : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sex</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sex" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-60 pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

function handleSignUp(
  data: RegisterInput,
  signUp?: SignUpResource,
): ResultAsync<SignUpResource, AppError> {
  if (!signUp) {
    return errAsync(new Error("Sign up resource is undefined."));
  }

  const createSignUp = signUp.create({
    emailAddress: data.email,
    password: data.password,
  });

  const result = fromPromise(createSignUp, (err) => {
    return new AppError(err, `Unexpected sign up error: ${typeof err}`);
  }).andThen((res) => okAsync(res));

  return result;
}

function prepareVerification(
  signUp: SignUpResource,
): ResultAsync<null, AppError> {
  const prepareVerification = signUp.prepareEmailAddressVerification();

  const result = fromPromise(prepareVerification, (err) => {
    return new AppError(err, `Unexpected verification error: ${typeof err}`);
  }).andThen(() => okAsync(null));

  return result;
}
