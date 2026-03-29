'use client';

export default function Navigation() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full bg-black/70 backdrop-blur-md border-b border-blue-500/30 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold blue-text tracking-wide">daddy's home</div>
          <p className="hidden md:block text-xs text-gray-400 tracking-[0.2em] uppercase">
            Shipped & Shipped Well.
          </p>
        </div>
        <div className="flex gap-8 text-sm md:text-base">
          <button onClick={() => scrollToSection('hero')} className="hover:text-blue-400 transition">Home</button>
          <button onClick={() => scrollToSection('projects')} className="hover:text-blue-400 transition">Projects</button>
          <button onClick={() => scrollToSection('skills')} className="hover:text-blue-400 transition">Skills</button>
          <button onClick={() => scrollToSection('experience')} className="hover:text-blue-400 transition">Experience</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-red-400 transition">Contact</button>
        </div>
      </div>
    </nav>
  );
}
