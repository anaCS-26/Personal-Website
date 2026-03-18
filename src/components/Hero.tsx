"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Hero.module.css";
import Scene from "./Scene";

export default function Hero({ playAnimation = true }: { playAnimation?: boolean }) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playAnimation) return;

    // Reset initial state before animating
    gsap.set(".hero-text", { y: 100, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(".hero-text", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
      });
    }, textRef);
    return () => ctx.revert();
  }, [playAnimation]);

  return (
    <section className={styles.heroSection}>
      <div className={styles.sceneContainer}>
        <Scene />
      </div>
      <div className={styles.content} ref={textRef}>
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
    </section>
  );
}
