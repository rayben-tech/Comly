"use client";

import { motion } from "framer-motion";

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: [0.43, 0.13, 0.23, 0.96] },
      opacity: { duration: 0.3 },
    },
  },
};

export function CircleHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block px-6 py-1 ${className ?? ""}`}>
      {children}
      <motion.svg
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute pointer-events-none overflow-visible"
        style={{ inset: "-12px -16px", width: "calc(100% + 32px)", height: "calc(100% + 24px)" }}
        initial="hidden"
        animate="visible"
      >
        <motion.path
          d="M 185 38
             C 185 15, 155 6, 100 6
             C 45 6, 15 15, 15 38
             C 15 61, 45 74, 100 74
             C 155 74, 185 61, 188 42"
          stroke="#5B2D91"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={draw}
        />
      </motion.svg>
    </span>
  );
}
