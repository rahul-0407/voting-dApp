"use client"

export default function Stats() {
  const stats = [
    {
      number: "50K+",
      label: "Active Users",
      description: "Trusted by thousands",
    },
    {
      number: "125K+",
      label: "Polls Created",
      description: "Democratic decisions made",
    },
    {
      number: "2.5M+",
      label: "Votes Cast",
      description: "Voices heard globally",
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable platform",
    },
  ]

  return (
    <section className="py-20 px-6 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16" data-scroll-fade>
          <h2 className="text-3xl font-light text-white mb-4">
            <span className="font-medium italic instrument">Trusted</span> by Communities
          </h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Join thousands of organizations and individuals making democratic decisions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8" data-scroll-stagger>
          {stats.map((stat, index) => (
            <div key={index} className="text-center group" data-scroll-stagger-item>
              <div className="mb-4">
                <div className="text-4xl md:text-5xl font-light text-white mb-2 group-hover:text-white/90 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-white font-medium text-sm mb-1">{stat.label}</div>
                <div className="text-white/50 text-xs">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
