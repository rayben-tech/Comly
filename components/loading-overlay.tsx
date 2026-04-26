"use client";

import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  messages: string[];
  icon?: React.ReactNode;
}

export function LoadingOverlay({ messages }: LoadingOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-28 gap-8 animate-in fade-in bg-white">
      <div className="loader-wrapper">
        <div className="loader" />
        <div className="loader-text">
          {"Generating".split("").map((letter, i) => (
            <span key={i} className="loader-letter">{letter}</span>
          ))}
        </div>
      </div>

      <div className="text-center space-y-3">
        <p
          key={currentMessage}
          className="text-gray-400 text-sm animate-in fade-in slide-in-from-bottom-2"
        >
          {messages[currentMessage]}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentMessage ? "w-4 h-1.5 bg-[#5B2D91]" : "w-1.5 h-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
