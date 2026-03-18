"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Contact.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-reveal", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" className={styles.section} ref={containerRef}>
      <div className={styles.container}>
        <h2 className={`${styles.heading} contact-reveal`}>
          LET&apos;S BUILD SOMETHING <br/><span className="accent-text">EXTRAORDINARY</span>
        </h2>
        
        <p className={`${styles.bodyText} contact-reveal`}>
          I&apos;m currently open to new opportunities. Whether you have a question or just want to say hi, I&apos;ll try my best to get back to you!
        </p>

        <div className={`contact-reveal ${styles.btnGroup}`}>
          <a href="mailto:asad.n.ansari.03@gmail.com" className={styles.emailBtn}>
            Say Hello
          </a>
          <a href="/AsadResume.pdf" target="_blank" rel="noopener noreferrer" className={styles.resumeBtn}>
            View Resume
          </a>
        </div>
      </div>
      
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Asad Ansari.</p>
        <div className={styles.socials}>
          <a href="https://github.com/anaCS-26" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/asad-ansari-ontario/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </footer>
    </section>
  );
}
