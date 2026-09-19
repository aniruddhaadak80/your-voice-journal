"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm dark:border-red-900 dark:bg-red-950">
      <div className="font-semibold">Something went wrong</div>
      <p className="mt-1 text-red-700 dark:text-red-300">{error.message}</p>
      <button onClick={reset} className="mt-3 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white">
        Try again
      </button>
    </div>
  );
}
