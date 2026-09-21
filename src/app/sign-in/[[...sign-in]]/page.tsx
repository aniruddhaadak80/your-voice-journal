import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth";
import { Card } from "@/components/ui";

export default function SignInPage() {
  if (!clerkConfigured()) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Auth not configured</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add Clerk keys to enable sign-in.{" "}
          <Link href="/connect" className="text-blue-600 hover:underline">Follow the Connect wizard →</Link>
        </p>
      </Card>
    );
  }
  return (
    <div className="flex justify-center py-10">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
