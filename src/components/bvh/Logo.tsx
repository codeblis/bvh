"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

	return <Image src={src} alt="BVH" width={146} height={163} className={className} priority />;
}
