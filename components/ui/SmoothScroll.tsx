"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08, // The lower the slower (smoothness)
        duration: 1.5,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}
    >
      {/* @ts-expect-error type mismatch with inner react types */}
      {children}
    </ReactLenis>
  );
}
