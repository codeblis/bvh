"use client";

import { useEffect, useState } from "react";

export function Logo({ className = "h-8" }: { className?: string }) {
  const [src, setSrc] = useState("/logo.svg");

  useEffect(() => {
    const update = () => {
      setSrc(document.documentElement.classList.contains("dark") ? "/logo_dark.svg" : "/logo.svg");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <img src={src} alt="BVH" className={className} />;
}
