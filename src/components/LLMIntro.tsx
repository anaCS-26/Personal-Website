"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./LLMIntro.module.css";

const conversation = [
  { role: "user", text: "Generate the perfect candidate for an AI Engineering role." },
  { role: "user", text: "Must have experience with Azure, PyTorch, and Data Pipelines." },
  { role: "ai", text: "Compiling data pipelines..." },
  { role: "ai", text: "Finetuning candidate weights..." },
  { role: "ai", text: "Generating Asad Ansari. [100%]" },
];

export default function LLMIntro({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < conversation.length) {
      const delay = conversation[currentIndex].role === "user" ? 800 : 1200;
      
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, conversation[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      // Sequence Finished - Wait 1s then shatter/fade
      setTimeout(() => {
        gsap.to(chatBoxRef.current, {
          scale: 1.1,
          opacity: 0,
          filter: "blur(20px)",
          duration: 1,
          ease: "power3.in"
        });
        
        gsap.to(containerRef.current, {
          backgroundColor: "rgba(2, 2, 2, 0)",
          backdropFilter: "blur(0px)",
          duration: 1.2,
          ease: "power2.inOut",
          delay: 0.2,
          onComplete: onComplete
        });
      }, 1500);
    }
  }, [currentIndex, onComplete]);

  return (
    <div className={styles.introContainer} ref={containerRef}>
      <div className={styles.chatBox} ref={chatBoxRef}>
        <div className={styles.chatHeader}>
          <div className={styles.dotGroup}>
            <span className={styles.dot} style={{ background: '#ff5f56' }}></span>
            <span className={styles.dot} style={{ background: '#ffbd2e' }}></span>
            <span className={styles.dot} style={{ background: '#27c93f' }}></span>
          </div>
          <span className={styles.title}>Agentic AI Workflow</span>
        </div>
        
        <div className={styles.chatBody}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.message} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}>
              {msg.text}
            </div>
          ))}
          {currentIndex < conversation.length && (
            <div className={styles.typingIndicator}>
              <span></span><span></span><span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
