"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("bvh-theme") as "light" | "dark" | null);
    const initial: "light" | "dark" = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("bvh-theme", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card/60 text-foreground transition hover:bg-card"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}