'use client';

import { useState } from 'react';

export default function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formState);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-black via-slate-950 to-black min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <div className="text-center mb-16 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">GET IN TOUCH</h2>
          <p className="text-gray-400 text-lg">Let's build something incredible together</p>
        </div>

        {/* Contact info */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <a
            href="https://github.com/suryansh1706"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/20 rounded-lg p-6 hover-lift text-center group slide-in-left"
          >
            <div className="text-4xl mb-4 group-hover:text-blue-400 transition">💻</div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">GitHub</h3>
            <p className="text-gray-400 mt-2">View my projects</p>
          </a>

          <a
            href="https://www.linkedin.com/in/suryansh-rastogi-23089324b/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-slate-950 to-black border border-red-500/20 rounded-lg p-6 hover-lift text-center group slide-in-top"
          >
            <div className="text-4xl mb-4 group-hover:text-red-400 transition">🔗</div>
            <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">LinkedIn</h3>
            <p className="text-gray-400 mt-2">Connect with me</p>
          </a>

          <a
            href="mailto:suryanshrastogi17@gmail.com"
            className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/20 rounded-lg p-6 hover-lift text-center group slide-in-right"
          >
            <div className="text-4xl mb-4 group-hover:text-blue-400 transition">📧</div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">Email</h3>
            <p className="text-gray-400 mt-2">Say hello</p>
          </a>
        </div>

        {/* Contact form */}
        <div className="bg-gradient-to-br from-slate-950 to-black border border-blue-500/30 rounded-lg p-8 max-w-2xl mx-auto slide-in-top">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold blue-text mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-black border border-blue-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold blue-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-black border border-blue-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold blue-text mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formState.message}
                onChange={handleChange}
                required
                placeholder="Tell me about your project..."
                rows={5}
                className="w-full px-4 py-3 bg-black border border-blue-500/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-red-500 text-black font-bold rounded hover-glow hover:bg-red-400 transition"
            >
              Send Message
            </button>

            {submitted && (
              <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded text-center">
                ✓ Message sent! I'll get back to you soon.
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 slide-in-bottom">
          <p>© 2025 Suryansh Rastogi. Built with Next.js, Tailwind CSS, and a touch of genius.</p>
        </div>
      </div>
    </section>
  );
}
