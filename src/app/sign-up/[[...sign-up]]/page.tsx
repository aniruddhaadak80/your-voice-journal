import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { clerkConfigured } from "@/lib/auth";
import { Card } from "@/components/ui";

export default function SignUpPage() {
  if (!clerkConfigured()) {
    return (
      <Card>
        <h1 className="text-xl font-bold">Auth not configured</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add Clerk keys to enable sign-up.{" "}
          <Link href="/connect" className="text-indigo-600 hover:underline">Follow the Connect wizard →</Link>
        </p>
      </Card>
    );
  }
  return (
    <div className="flex justify-center py-10">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
