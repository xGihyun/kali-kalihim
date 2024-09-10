import {
  VerificationSchema,
  type RegisterInput,
  type VerificationInput,
} from "@/lib/schemas/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useStore } from "@nanostores/react";
import { $signUpStore, $clerkStore } from "@clerk/astro/client";
import { navigate } from "astro:transitions/client";
import { actions } from "astro:actions";
import type { Clerk, SignUpResource } from "@clerk/types";
import { AppError } from "@/lib/types/error";
import {
  errAsync,
  fromPromise,
  fromSafePromise,
  okAsync,
  ResultAsync,
} from "neverthrow";
import { isClerkAPIResponseError } from "@clerk/clerk-react/errors";

type Props = {
  registerData: RegisterInput;
};

export default function Component(props: Props): JSX.Element {
  const signUp = useStore($signUpStore);
  const clerk = useStore($clerkStore);

  const form = useForm<VerificationInput>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: VerificationInput): Promise<void> {
    const toastId = toast.loading("Submitting...");

    console.log("Verification values:", values);

    const result = handleVerification(values, clerk, signUp).andThen(() =>
      handleRegister(props.registerData),
    );

    return result.match(
      () => {
        toast.success("Successfully registered.", { id: toastId });
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
        <CardTitle>Please Check Your Email</CardTitle>
        <CardDescription>
          A verification code was sent to {' '}
          <span className="text-foreground font-jost-medium">{props.registerData.email}</span>
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6 flex justify-center">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function handleVerification(
  data: VerificationInput,
  clerk: Clerk | null,
  signUp?: SignUpResource,
): ResultAsync<null, AppError> {
  if (!clerk) {
    return errAsync(new Error("Clerk client is undefined."));
  }

  if (!signUp) {
    return errAsync(new Error("Sign up resource is undefined."));
  }

  const attemptVerification = signUp.attemptEmailAddressVerification({
    code: data.code,
  });

  const result = fromPromise(attemptVerification, (err) => {
    if (isClerkAPIResponseError(err)) {
      return err;
    }

    return new AppError(err, `Unexpected verification error: ${typeof err}`);
  }).andThen(() => okAsync(null));

  return result;
}

function handleRegister(data: RegisterInput): ResultAsync<null, AppError> {
  const register = fromSafePromise(actions.register(data)).andThen((res) => {
    if (res.error) {
      return errAsync(new AppError(res.error));
    }

    return okAsync(null);
  });

  return register;
}
