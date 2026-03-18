"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Hero.module.css";
import Scene from "./Scene";

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Create a cinematic transition that scrubs with the user's scroll.
      // 1. The page pins (stops scrolling down)
      // 2. The massive "ENGINEERING INTELLIGENCE" text blurs and fades OUT
      // 3. The Scene & Hero Subtitles blur and fade IN
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=150%", // User scrolls 1.5x screen height to complete the sequence
          scrub: 1, // Smooth, damped scrubbing
          pin: true, // Prevents natural scroll, simulating an immersive transition
        }
      });

      // Initially prepare hero items to be hidden
      gsap.set(".hero-text", { opacity: 0, y: 50, filter: "blur(10px)" });
      gsap.set(".scene-container", { opacity: 0, scale: 0.9 });

      // Build the scrub animation
      tl.to(".intro-layer", {
        opacity: 0,
        filter: "blur(20px)",
        scale: 1.05,
        duration: 2
      }, 0)
      .to(".hero-text", {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.2,
        duration: 2,
        ease: "power2.out"
      }, 1) // Starts halfway through the intro fading out
      .to(".scene-container", {
        opacity: 1,
        scale: 1,
        duration: 2,
        ease: "power2.out"
      }, 1);

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.heroSection} ref={containerRef}>
      
      {/* Intro Layer - Absolutely positioned on top to start the experience */}
      <div className={`intro-layer ${styles.introLayer}`}>
        <h1 className={styles.introText}>
          ENGINEERING
          <br />
          INTELLIGENCE.
        </h1>
      </div>

      <div className={styles.content}>
        <h1 className={`${styles.title} hero-text`}>
          AI & CLOUD<br />
          <span className={styles.accent}>ENGINEER</span>
        </h1>
        <p className={`${styles.subtitle} hero-text`}>
          I build scalable data pipelines, intelligent AI systems, and cloud architectures to solve complex, real-world problems.
        </p>
        <div className={`hero-text ${styles.actions}`}>
          <a href="#projects" className={styles.primaryBtn}>Explore Work</a>
        </div>
      </div>

      {/* The 3D Glass Object */}
      <div className={`scene-container ${styles.sceneContainer}`}>
        <Scene />
      </div>

    </section>
  );
}
