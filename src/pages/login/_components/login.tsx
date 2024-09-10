import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth";
import { AppError } from "@/lib/types/error";
import { $clerkStore, $signInStore } from "@clerk/astro/client";
import type { Clerk, SignInResource } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@nanostores/react";
import { navigate } from "astro/virtual-modules/transitions-router.js";
import { errAsync, fromPromise, okAsync, type ResultAsync } from "neverthrow";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Component(): JSX.Element {
  const signIn = useStore($signInStore);
  const clerk = useStore($clerkStore);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput): Promise<void> {
    const toastId = toast.loading("Submitting...");

    console.log("Login values:", values);

    const result = handleSignIn(values, signIn).andThen((res) => activateSession(res, clerk));

    return result.match(
      () => {
        toast.success("Successfully logged in!", { id: toastId });

        navigate("/");
      },
      (err) => {
        console.error(JSON.stringify(err, null, 2));

        toast.error(err.message, {
          id: toastId,
          duration: Number.POSITIVE_INFINITY,
        });
      },
    );
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Please enter your credentials to sign in.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 p-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@gmail.com" {...field} />
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
          </CardContent>

          <CardFooter className="flex-col">
            <Button type="submit" className="w-full">
              Submit
            </Button>

            <p className="mt-6">
              Don't have an account?{" "}
              <a href="/register" className="font-jost-medium underline">
                Register
              </a>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function handleSignIn(
  data: LoginInput,
  signIn?: SignInResource,
): ResultAsync<SignInResource, AppError> {
  if (!signIn) {
    return errAsync(new Error("Sign in resource is undefined."));
  }

  const createSignIn = signIn.create({
    identifier: data.email,
    password: data.password,
  });

  const result = fromPromise(createSignIn, (err) => {
    return new AppError(err, `Unexpected sign in error: ${typeof err}`);
  }).andThen((res) => okAsync(res));

  return result;
}

function activateSession(
  signIn: SignInResource,
  clerk: Clerk | null,
): ResultAsync<null, AppError> {
  if (!clerk) {
    return errAsync(new Error("Clerk client is undefined."));
  }

  const activateSession = clerk.setActive({ session: signIn.createdSessionId });

  const result = fromPromise(activateSession, (err) => {
    return new AppError(err, `Unexpected session error: ${typeof err}`);
  }).andThen(() => okAsync(null));

  return result;
}
