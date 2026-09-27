import { Heart, Mail, ArrowUpRight } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin } from "./BrandIcons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative">
      {/* ─── CTA Section ─── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[#0a192f]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 font-mono text-sm mb-4">
            06. What's Next?
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's Work Together
          </h2>
          <p className="text-lg text-[#8892b0] mb-10 max-w-xl mx-auto leading-relaxed">
            I'm currently open to new opportunities and collaborations. Whether
            you have a project in mind or just want to connect, I'd love to hear
            from you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:paraynomarkphilip@gmail.com"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-[#0a192f] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
            >
              <Mail size={18} />
              Say Hello
            </a>
            <a
              href="https://www.linkedin.com/in/mark-philip-parayno/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-medium rounded-lg transition-all duration-200"
            >
              <Linkedin size={18} />
              Connect on LinkedIn
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer Bar ─── */}
      <div className="bg-[#0a192f] border-t border-[#233554]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-[#112240] rounded-lg flex items-center justify-center text-amber-400 text-sm font-bold border border-amber-500/30">
                  MP
                </div>
                <span className="text-lg font-bold text-white">
                  Mark Philip V. Parayno
                </span>
              </div>
              <p className="text-sm text-[#8892b0] leading-relaxed">
                Software Engineer specializing in Mobile (Flutter) & Web
                Applications. Building production-grade solutions for enterprise
                clients.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {["About", "Skills", "Experience", "Projects", "Education"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-sm text-[#8892b0] hover:text-amber-400 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                Connect
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/MarkParayno1004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg text-[#8892b0] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/in/mark-philip-parayno/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg text-[#8892b0] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="mailto:paraynomarkphilip@gmail.com"
                  className="p-2.5 rounded-lg text-[#8892b0] hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all"
                  aria-label="Email"
                >
                  <Mail size={20} />
                </a>
              </div>
              <p className="mt-3 text-sm text-[#8892b0]">
                paraynomarkphilip@gmail.com
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-[#233554]/50 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-[#8892b0]">
              © {currentYear} Mark Philip V. Parayno. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-[#8892b0]">
              Built with{" "}
              <Heart size={14} className="text-amber-500" fill="currentColor" />{" "}
              using React, TypeScript & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
