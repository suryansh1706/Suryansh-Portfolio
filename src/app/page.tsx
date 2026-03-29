import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Contact from '@/components/Contact';
import DynamicBackground from '@/components/DynamicBackground';
import AIAssistantWidget from '@/components/AIAssistantWidget';
import CPStatsSection from '@/components/CPStatsSection';

export default function Home() {
  return (
    <main className="bg-black overflow-hidden relative">
      <DynamicBackground />
      <Navigation />
      <Hero />
      <Projects />
      <Skills />
      <CPStatsSection />
      <Experience />
      <Contact />
      <AIAssistantWidget />
    </main>
  );
}
