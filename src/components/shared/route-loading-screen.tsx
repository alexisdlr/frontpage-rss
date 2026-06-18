"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type RouteLoadingScreenProps = {
  className?: string;
};

export function RouteLoadingScreen({ className }: RouteLoadingScreenProps) {
  return (
    <div
      className={className}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page"
    >
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-3"
      >
        <Image
          src="/images/icon-512.webp"
          alt=""
          width={64}
          height={64}
          priority
        />
        <span className="text-2xl font-black tracking-tight text-text-secondary">
          Frontpage
        </span>
      </motion.div>
    </div>
  );
}
