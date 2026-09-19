"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => {
        const el = document.documentElement;
        el.classList.toggle("dark");
        setDark(el.classList.contains("dark"));
      }}
      className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
