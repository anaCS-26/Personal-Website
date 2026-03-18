"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Projects.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const projects = [
    {
      title: "Lung Disease AI Scanner",
      description: "An end-to-end Azure inference pipeline leveraging a PyTorch CNN and GPT-4o-mini to classify and summarize chest X-rays.",
      tags: ["Python", "PyTorch", "Azure"],
      link: "https://github.com/anaCS-26/Pulmolens-model",
      color: "#00f0ff"
    },
    {
      title: "Sports Data Pipeline",
      description: "An automated web scraping pipeline built to extract local DCA cricket data and store it in MySQL for Power BI dashboards.",
      tags: ["Python", "MySQL", "Power BI"],
      link: "https://github.com/anaCS-26/DCA-MySQLProject",
      color: "#7000ff"
    },
    {
      title: "3D Interactive Portfolio",
      description: "A visually stunning personal portfolio featuring dynamic React Three Fiber elements and buttery smooth GSAP animations.",
      tags: ["Next.js", "Three.js", "GSAP"],
      link: "https://github.com/anaCS-26/Personal-Website",
      color: "#ff0055"
    }
  ];

  return (
    <section id="projects" className={styles.section} ref={containerRef}>
      <h2 className={styles.heading}>FEATURED <span className="accent-text">WORK</span></h2>
      
      <div className={styles.projectGrid}>
        {projects.map((project, idx) => (
          <div key={idx} className={`${styles.projectCard} project-card`}>
            <div className={styles.cardGlow} style={{ background: project.color }}></div>
            <div className={styles.cardContent}>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p className={styles.projectDesc}>{project.description}</p>
              
              <div className={styles.tags}>
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className={styles.tag}>{tag}</span>
                ))}
              </div>
              
              <a 
                href={project.link} 
                className={styles.projectLink} 
                style={{ color: project.color }}
                aria-label={`View ${project.title} project`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Project <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
