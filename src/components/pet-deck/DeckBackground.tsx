"use client";

import { PawPrint } from "lucide-react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import React from "react";

import { cn } from "@/lib/ui/classNames";

const pawPrints = [
  {
    className: "left-[4%] top-[18%] h-16 w-16 rotate-[-18deg] text-success",
    drift: 11,
    float: 7,
    duration: 19,
    delay: 0,
  },
  {
    className: "right-[5%] top-[24%] h-20 w-20 rotate-[14deg] text-primary",
    drift: -15,
    float: 9,
    duration: 22,
    delay: 1.2,
  },
  {
    className: "left-[12%] bottom-[18%] h-14 w-14 rotate-[22deg] text-secondary",
    drift: 8,
    float: 6,
    duration: 20,
    delay: 2.1,
  },
  {
    className:
      "right-[16%] bottom-[14%] h-16 w-16 rotate-[-16deg] text-accent-foreground",
    drift: -10,
    float: 8,
    duration: 24,
    delay: 0.7,
  },
  {
    className: "left-[48%] top-[10%] h-10 w-10 rotate-[12deg] text-success",
    drift: 6,
    float: 5,
    duration: 18,
    delay: 1.6,
  },
];

type DeckBackgroundProps = {
  dragX: MotionValue<number>;
};

export function DeckBackground({ dragX }: DeckBackgroundProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--deck-sky))_0%,hsl(var(--deck-mint))_54%,hsl(var(--background))_100%)]" />
      <div className="absolute inset-0 opacity-[0.13]">
        {pawPrints.map((paw) => (
          <FloatingPaw key={paw.className} dragX={dragX} {...paw} />
        ))}
      </div>
    </div>
  );
}

type FloatingPawProps = {
  dragX: MotionValue<number>;
  className: string;
  drift: number;
  float: number;
  duration: number;
  delay: number;
};

function FloatingPaw({
  dragX,
  className,
  drift,
  float,
  duration,
  delay,
}: FloatingPawProps) {
  const shouldReduceMotion = useReducedMotion();
  const parallaxX = useTransform(dragX, [-220, 0, 220], [-drift, 0, drift]);
  const springX = useSpring(parallaxX, {
    damping: 32,
    mass: 0.9,
    stiffness: 70,
  });

  return (
    <motion.div
      style={{ x: shouldReduceMotion ? 0 : springX }}
      className={cn("absolute hidden sm:block", className)}
    >
      <motion.div
        animate={
          shouldReduceMotion ? undefined : { y: [0, -float, 0, float / 2, 0] }
        }
        transition={{
          delay,
          duration,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <PawPrint className="h-full w-full" strokeWidth={2.4} />
      </motion.div>
    </motion.div>
  );
}
