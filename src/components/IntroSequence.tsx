"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./IntroSequence.module.css";

const lines = [
  "INITIALIZING CLUSTER NODE [us-east-1a]...",
  "ALLOCATING TENSOR CORES... [OK]",
  "LOADING LLM WEIGHTS... [OK]",
  "ESTABLISHING DATABASE CONNECTIONS... [OK]",
  "MOUNTING DATABRICKS VOLUMES... [OK]",
  "BOOT SEQUENCE COMPLETE.",
  "WELCOME TO THE WORKSPACE OF ASAD."
];

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState<number>(0);
  
  useEffect(() => {
    // Reveal lines incrementally
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev < lines.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visibleLines === lines.length) {
      // Trigger Hero animations mid-slide
      setTimeout(() => onComplete(), 1000); 

      // Sequence done typing. Wait a moment, then animate out.
      gsap.to(containerRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.inOut",
        delay: 0.8
      });
    }
  }, [visibleLines, onComplete]);

  return (
    <div className={styles.introContainer} ref={containerRef}>
      <div className={styles.terminal} ref={textRef}>
        {lines.map((line, idx) => (
          <div 
            key={idx} 
            className={styles.line} 
            style={{ opacity: idx < visibleLines ? 1 : 0 }}
          >
            <span className={styles.prompt}>&gt;</span> {line}
          </div>
        ))}
        {visibleLines < lines.length && (
          <div className={styles.cursor}>█</div>
        )}
      </div>
    </div>
  );
}
