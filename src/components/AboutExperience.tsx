"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./AboutExperience.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function AboutExperience() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal-text", {
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
      
      gsap.from(".exp-item", {
        scrollTrigger: {
          trigger: ".exp-container",
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const experiences = [
    {
      role: "Tech Strategic Initiatives",
      company: "Brookfield Renewable",
      date: "May 2025 - Sep 2025",
      description: "Engineered Python and SQL data pipelines on Microsoft Fabric to extract and model multi-million-record datasets.",
    },
    {
      role: "AI & Cloud Intern",
      company: "Enbridge",
      date: "Jan 2024 - Sep 2024",
      description: "Prototyped agent-based AI workflows on Azure AI Foundry and developed RESTful integrations via Databricks SQL.",
    },
    {
      role: "Teaching Assistant",
      company: "Carleton University",
      date: "Sep 2022 - Dec 2025",
      description: "Delivered weekly technical mentorship to 100+ students in Python, Java, and Reinforcement Learning concepts.",
    }
  ];

  return (
    <section id="about" className={styles.section} ref={containerRef}>
      <div className={styles.grid}>
        {/* About Info */}
        <div className={styles.aboutCol}>
          <h2 className={`${styles.heading} reveal-text`}>ABOUT<br/><span className="accent-text">ME</span></h2>
          <p className={`${styles.bodyText} reveal-text`}>
            I&apos;m Asad, an AI &amp; ML Stream Computer Science major at Carleton University. I specialize in engineering data pipelines, deploying cloud architectures, and integrating Large Language Models into production environments.
          </p>
          <p className={`${styles.bodyText} reveal-text`}>
            With experience spanning Azure, AWS, and modern data stacks, I am passionate about translating complex data into actionable insights and robust applications.
          </p>
        </div>

        {/* Experience Info */}
        <div id="experience" className={`${styles.expCol} exp-container`}>
          <h3 className={`${styles.subheading} reveal-text`}>EXPERIENCE</h3>
          <div className={styles.expList}>
            {experiences.map((exp, idx) => (
              <div key={idx} className={`${styles.expItem} exp-item`}>
                <div className={styles.expHeader}>
                  <h4 className={styles.role}>{exp.role}</h4>
                  <span className={styles.date}>{exp.date}</span>
                </div>
                <h5 className={styles.company}>{exp.company}</h5>
                <p className={styles.expDesc}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
