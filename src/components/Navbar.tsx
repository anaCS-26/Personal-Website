"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.8 });
  }, []);

  return (
    <header className={styles.navbar} ref={navRef}>
      <div className={styles.logo}>
        <Link href="/">ASAD.</Link>
      </div>
      <nav className={styles.navLinks}>
        <Link href="#about">About</Link>
        <Link href="#experience">Experience</Link>
        <Link href="#projects">Projects</Link>
        <Link href="#contact" className={styles.contactBtn}>Contact</Link>
      </nav>
    </header>
  );
}
