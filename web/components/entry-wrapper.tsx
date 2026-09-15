"use client";

import React, { useState, useEffect } from "react";
import { EntryAnimation } from "@/components/ui/entry-animation";

/* 
  Wraps children and shows the entry animation once per session.
  After animation completes, children fade in smoothly.
*/
export function EntryWrapper({ children }: { children: React.ReactNode }) {
  const [animationDone, setAnimationDone] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("sm_intro_shown");
    if (!shown) {
      setShowAnimation(true);
    } else {
      setAnimationDone(true);
    }
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem("sm_intro_shown", "1");
    setAnimationDone(true);
    setShowAnimation(false);
  };

  return (
    <>
      {showAnimation && <EntryAnimation onComplete={handleComplete} />}
      <div
        style={{
          opacity: animationDone ? 1 : 0,
          transform: animationDone ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {children}
      </div>
    </>
  );
}
