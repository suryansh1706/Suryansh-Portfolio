'use client';

const skillCategories = [
  {
    category: "Languages",
    skills: ["C++", "Python", "JavaScript", "TypeScript", "SQL", "HTML/CSS"]
  },
  {
    category: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Redux", "Responsive Design", "Framer Motion"]
  },
  {
    category: "Backend",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "FastAPI", "REST APIs"]
  },
  {
    category: "Tools & Platforms",
    skills: ["Git", "GitHub", "Vercel", "Docker", "Firebase", "AWS"]
  },
  {
    category: "Core Competencies",
    skills: ["Web Development", "Full Stack Development", "API Design", "Database Design", "Problem Solving", "Competitive Programming"]
  }
];

export default function Skills() {
  return (
    <section id="skills" className="py-20 bg-gradient-to-b from-black via-slate-950 to-black min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">TECHNICAL ARSENAL</h2>
          <p className="text-gray-400 text-lg">The tools and technologies in my build stack</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <div
              key={category.category}
              className="slide-in-left"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-6 hover-glow">
                <h3 className="text-xl font-bold blue-text mb-4">{category.category}</h3>
                <div className="space-y-2">
                  {category.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skills summary */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-red-500 p-8 rounded slide-in-right">
          <h3 className="text-2xl font-bold blue-text mb-3">Competitive Edge</h3>
          <p className="text-gray-300 leading-relaxed">
            Competitive programmer with strong algorithmic thinking and problem-solving skills. Expert in building scalable, efficient web applications using modern tech stacks. 
            Proficient in both frontend and backend development with architectural expertise. Passionate about optimizing performance, writing clean code, and tackling complex challenges 
            with innovative solutions.
          </p>
        </div>
      </div>
    </section>
  );
}
