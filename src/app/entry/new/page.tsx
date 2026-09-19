import NewEntryForm from "@/components/NewEntryForm";

export default function NewEntryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">New entry</h1>
      <p className="text-sm text-zinc-500">Type, dictate with voice, attach files. Everything saves to your Neon DB.</p>
      <NewEntryForm />
    </div>
  );
}
