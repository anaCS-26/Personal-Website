"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutExperience from "@/components/AboutExperience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <AboutExperience />
      <Projects />
      <Contact />
    </main>
  );
}
