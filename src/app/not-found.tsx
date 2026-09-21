import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">404</p>
      <h1 className="text-3xl font-bold tracking-tight">Lost in the stacks</h1>
      <p className="text-sm text-zinc-500">That page doesn&apos;t exist — pick a door.</p>
      <div className="flex justify-center gap-2">
        <Link href="/journal">
          <Button>Journal</Button>
        </Link>
        <Link href="/showcase">
          <Button variant="secondary">Showcase</Button>
        </Link>
        <Link href="/connect">
          <Button variant="ghost">Connect</Button>
        </Link>
      </div>
    </div>
  );
}
