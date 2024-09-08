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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useStore } from "@nanostores/react";
import { $signUpStore, $clerkStore } from "@clerk/astro/client";
import { navigate } from "astro:transitions/client";
import { actions } from "astro:actions";

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

  async function handleVerification(data: VerificationInput) {
    if (!signUp) {
      return;
    }

    if (!clerk) {
      return;
    }

    try {
      const signInAttempt = await signUp.attemptEmailAddressVerification({
        code: data.code,
      });

      if (signInAttempt.status === "complete") {
        clerk.setActive({ session: signInAttempt.createdSessionId });

        navigate("/");
      } else {
        console.error(signInAttempt);
      }
    } catch (err) {
      console.error("Error:", JSON.stringify(err, null, 2));
    }
  }

  async function onSubmit(values: VerificationInput) {
    const toastId = toast.loading("Submitting...");

    console.log("Verification values:", values);
    await handleVerification({ code: values.code });

    //const { error } = await actions.register(props.registerData);
    //
    //if (error) {
    //  console.error("ERROR:", error);
    //  toast.error(error.message, {
    //    id: toastId,
    //    duration: Number.POSITIVE_INFINITY,
    //  });
    //  return;
    //}

    toast.success("Successfully registered.", { id: toastId });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
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

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
