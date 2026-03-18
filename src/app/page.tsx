"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutExperience from "@/components/AboutExperience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import CinematicIntro from "@/components/CinematicIntro";

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [removeIntro, setRemoveIntro] = useState(false);

  return (
    <main>
      {!removeIntro && (
        <CinematicIntro 
          onComplete={() => {
            setIntroFinished(true);
            setTimeout(() => setRemoveIntro(true), 2000);
          }} 
        />
      )}
      <Navbar />
      <Hero playAnimation={introFinished} />
      <AboutExperience />
      <Projects />
      <Contact />
    </main>
  );
}
