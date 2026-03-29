'use client';

const projects = [
  {
    id: 1,
    title: "Your Fitness Guide",
    description: "A full-stack meal tracking system with JWT cookie auth, daily macro aggregation, nutritional insights, and personalized fitness goals.",
    technologies: ["Node.js", "Express.js", "MongoDB", "JWT", "React"],
    link: "https://github.com/suryansh1706/fitness-app",
    type: "Full Stack",
    highlights: ["HTTP-only cookie auth", "Daily macro engine", "Pie-chart macro insights"]
  },
  {
    id: 2,
    title: "To-Do List Application",
    description: "Dynamic task management application with advanced features including task prioritization, filtering, and persistent storage. Deployed and live with seamless user experience.",
    technologies: ["Next.js", "Tailwind CSS", "Vercel", "LocalStorage"],
    link: "https://to-do-list-for-everyone.vercel.app/",
    liveLink: "https://to-do-list-for-everyone.vercel.app/",
    type: "Frontend",
    highlights: ["Live deployment", "Responsive design", "Task organization"]
  },
  {
    id: 3,
    title: "Vacation Email Responder",
    description: "Intelligent automation tool that manages vacation auto-replies using advanced email APIs. Implements smart scheduling and email thread management for professional users.",
    technologies: ["Python", "Gmail API", "FastAPI", "Automation"],
    link: "https://github.com/suryansh1706/vacation-email-responder",
    type: "Backend",
    highlights: ["Email automation", "API integration", "Smart scheduling"]
  }
];

export default function Projects() {
  const flowSteps = ["Routes", "Controllers", "Services", "Models", "MongoDB"];

  return (
    <section id="projects" className="py-20 bg-black min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 slide-in-top">
          <h2 className="text-5xl md:text-6xl font-bold blue-text mb-4">FEATURED PROJECTS</h2>
          <p className="text-gray-400 text-lg">Innovations built with precision and passion</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`bg-gradient-to-br from-slate-950 to-black border border-blue-500/20 rounded-lg p-6 hover-lift group ${index === 0 ? 'slide-in-left' : index === 1 ? 'slide-in-top' : 'slide-in-right'}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Project header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition">
                  {project.title}
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded">
                  {project.type}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-4 text-sm line-clamp-3">
                {project.description}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.highlights.map((highlight) => (
                  <span key={highlight} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Technologies */}
              <div className="mb-6 pb-6 border-b border-blue-500/20">
                <p className="text-xs text-gray-500 uppercase mb-2 font-bold">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex gap-3">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-500 hover:text-black transition font-semibold"
                >
                  GitHub
                </a>
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-red-500 text-black rounded hover:bg-red-400 transition font-semibold"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-slate-950 to-black border border-red-500/20 rounded-xl p-6 md:p-8 slide-in-top">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Fitness Guide: System Flow</h3>
          <p className="text-gray-400 mb-6">
            Scalable backend pipeline used for auth, meal logging, and daily nutrition aggregation.
          </p>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {flowSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-2 md:gap-3">
                <span className="px-3 py-2 text-sm md:text-base font-semibold rounded border border-blue-500/30 bg-blue-500/10 text-blue-300">
                  {step}
                </span>
                {index < flowSteps.length - 1 && (
                  <span className="text-red-400 font-bold text-lg md:text-xl">-&gt;</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-5">
            Core logic: aggregate daily meals -&gt; compute protein/carbs/fats/calories -&gt; compare against user goals -&gt; return actionable insights.
          </p>
        </div>
      </div>
    </section>
  );
}
