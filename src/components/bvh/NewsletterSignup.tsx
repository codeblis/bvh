"use client";

export function NewsletterSignup({ cta, placeholder, hint }: { cta: string; placeholder: string; hint: string }) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <input
        required
        type="email"
        placeholder={placeholder}
        className="flex-1 rounded-md border border-border bg-background/80 px-4 py-3 text-[13px] text-foreground focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-gold)] transition hover:brightness-110"
      >
        {cta}
      </button>
      {hint && <p className="text-[11px] text-muted-foreground sm:col-span-2 text-center">{hint}</p>}
    </form>
  );
}
