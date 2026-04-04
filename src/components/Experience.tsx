'use client';

const experiences = [
  {
    role: "Head of Competitive Programming",
    company: "Founder College Competitive Programming",
    period: "Feb 2025 - Present",
    description: "Leading competitive programming initiatives at Founder College, mentoring 100+ students in competitive programming concepts, algorithms, and data structures.",
    highlights: ["100+ students trained", "Structured learning programs", "Contest preparation"]
  },
  {
    role: "Founder, Competitive Programming Community",
    company: "Maharaja Agrasen Institute of Technology",
    period: "Aug 2025 - Present",
    description: "Founded and built a student-led competitive programming community at MAIT, driving structured practice, peer learning, and contest culture.",
    highlights: ["Community founded", "Structured CP practice", "Contest culture building"]
  }
];

const education = [
  {
    degree: "B.Tech",
    school: "Maharaja Agrasen Institute of Technology",
    branch: "Computer Science",
    cgpa: "8.39",
    period: "2023 - 2027",
  },
];

const achievements = [
  {
    title: "Global Rank 22",
    subtitle: "CodeChef Contest",
    period: "2024",
    impact: "Elite global contest performance",
  },
  {
    title: "Under 2K Rank",
    subtitle: "IICPC hosted on CodeChef",
    period: "2024",
    impact: "Strong rank in a highly competitive contest",
  },
  {
    title: "Head of Competitive Programming",
    subtitle: "Founder College CP Initiative",
    period: "2025 - Present",
    impact: "Driving structured CP growth and contest culture",
  },
  {
    title: "100+ Students Mentored",
    subtitle: "CP Training and Strategy Coaching",
    period: "2025 - Present",
    impact: "Scalable mentoring impact in algorithms and DSA",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-20 bg-black min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">MISSION HISTORY</h2>
          <p className="text-gray-400 text-lg">Experience forged in real-world challenges</p>
        </div>

        {/* Professional Experience */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold blue-text mb-8">Professional Experience</h3>
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-slate-950 to-black border border-blue-500/20 rounded-lg p-6 hover-lift slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                  <div>
                    <h4 className="text-2xl font-bold text-white">{exp.role}</h4>
                    <p className="text-red-400 font-semibold">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">{exp.period}</span>
                </div>
                <p className="text-gray-300 mb-4">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.highlights.map((highlight) => (
                    <span key={highlight} className="text-xs bg-blue-500/10 border border-blue-500/30 text-blue-300 px-3 py-1 rounded">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="text-3xl font-bold blue-text mb-8">Education</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-6 hover-glow slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className="text-xl font-bold text-white mb-2">{edu.degree}</h4>
                <p className="text-blue-300 mb-1">{edu.school}</p>
                <p className="text-gray-300 text-sm">Branch: {edu.branch}</p>
                <p className="text-gray-300 text-sm">CGPA: {edu.cgpa}</p>
                <p className="text-gray-400 text-sm">{edu.period}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold blue-text mb-8">CP Best Feats</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-lg p-6 hover-glow slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className="text-xl font-bold text-white mb-2">{achievement.title}</h4>
                <p className="text-blue-300 mb-1">{achievement.subtitle}</p>
                <p className="text-gray-400 text-sm">{achievement.period}</p>
                <p className="text-gray-300 text-sm mt-3">{achievement.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-16 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 p-8 rounded slide-in-top">
          <h3 className="text-2xl font-bold blue-text mb-4">Certifications</h3>
          <div className="space-y-2 text-gray-300">
            <a
              href="https://www.hackerrank.com/certificates/2b66df3335ed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 underline underline-offset-4"
            >
              <span>✓ HackerRank Problem Solving Certificate</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
