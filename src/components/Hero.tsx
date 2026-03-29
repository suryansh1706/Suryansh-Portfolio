'use client';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black flex items-center justify-center pt-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 text-center px-6 slide-in-top max-w-4xl">
        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-red-400 text-transparent bg-clip-text">
          SURYANSH RASTOGI
        </h1>

        {/* Signature statement */}
        <div className="border-l-4 border-blue-500 pl-6 mb-8 text-left md:text-center md:pl-0 md:border-l-0">
          <p className="text-xl md:text-3xl italic text-gray-300 mb-2 leading-relaxed">
            "Where competitive programming discipline meets production excellence.
             Shipping fast, shipping clean, solving problems that actually matter."
          </p>
          <p className="text-sm text-blue-400 mt-4">- Suryansh Rastogi</p>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Specializing in building scalable, interactive web applications with cutting-edge technologies. 
          From fitness tracking to productivity tools, I turn ideas into reality.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button 
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-blue-500 text-black font-bold rounded hover:bg-blue-400 hover-glow hover-lift transition"
          >
            View My Work
          </button>
          <button 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 border-2 border-red-500 text-red-400 font-bold rounded hover:bg-red-500 hover:text-black hover-lift transition"
          >
            Get In Touch
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
