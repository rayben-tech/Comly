"use client";

import { motion } from "framer-motion";

export function WispGhost({ size = 200 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "visible" }}
    >
      <g fill="#7C22FF">
        <rect x={4}  y={0}  width={9}  height={2}  />
        <rect x={2}  y={2}  width={13} height={11} />
        <rect x={0}  y={5}  width={2}  height={3}  />
        <rect x={15} y={5}  width={2}  height={3}  />
        <rect x={2}  y={13} width={2}  height={3}  />
        <rect x={5}  y={13} width={2}  height={4}  />
        <rect x={10} y={13} width={2}  height={4}  />
        <rect x={13} y={13} width={2}  height={3}  />
      </g>

      {/* Eyes: eyelid closes top-down (y rises, height shrinks to 0) then reopens */}
      <motion.rect
        fill="#0D0D0D" x={5} width={2}
        animate={{ y: [5,5,8,9,8,5], height: [4,4,1,0,1,4] }}
        transition={{ duration: 2.5, times: [0,0.82,0.88,0.91,0.95,1], repeat: Infinity, repeatDelay: 0.3 }}
      />
      <motion.rect
        fill="#0D0D0D" x={10} width={2}
        animate={{ y: [5,5,8,9,8,5], height: [4,4,1,0,1,4] }}
        transition={{ duration: 2.5, times: [0,0.82,0.88,0.91,0.95,1], repeat: Infinity, repeatDelay: 0.3 }}
      />
    </svg>
  );
}
