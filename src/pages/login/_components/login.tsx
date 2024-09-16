import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function Component(): JSX.Element {
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <Button onClick={() => toast.success("ASDADS")}>TOAST</Button>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Please enter your credentials to sign in.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <a href="/login/google">
          Login with Google
        </a>

        <Button onClick={() => {

        }}>
        </Button>
      </CardContent>
    </Card>
  );
}

//async function handleLogin() {
//  const url = await getGoogle
//}
