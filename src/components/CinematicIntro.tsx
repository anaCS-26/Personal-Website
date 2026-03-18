"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./CinematicIntro.module.css";

export default function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // 1. Initial wait on black screen
    // 2. Slow fade in of title
    // 3. Pause
    // 4. Blur and fade out entirely

    const tl = gsap.timeline({
      onComplete: () => {
        // Restore scroll and safely remove component
        document.body.style.overflow = '';
        onComplete();
      }
    });

    // Lock body scroll while intro is playing
    document.body.style.overflow = 'hidden';

    // Reset state
    gsap.set(textRef.current, { opacity: 0, filter: "blur(20px)", scale: 0.95 });

    tl.to(textRef.current, {
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      duration: 2.5,
      ease: "power2.out",
      delay: 0.5
    })
    .to(textRef.current, {
      opacity: 0,
      filter: "blur(20px)",
      scale: 1.05,
      duration: 1.5,
      ease: "power2.in",
      delay: 1.5
    })
    .to(containerRef.current, {
      backgroundColor: "rgba(2, 2, 2, 0)",
      backdropFilter: "blur(0px)",
      duration: 1.5,
      ease: "power3.inOut"
    }, "-=1.0"); // Start dissolving background slightly before text fully vanishes
    
  }, [onComplete]);

  return (
    <div className={styles.introContainer} ref={containerRef}>
      <h1 className={styles.introText} ref={textRef}>
        ENGINEERING INTELLIGENCE.
      </h1>
    </div>
  );
}
