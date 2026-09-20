import { Heart, Mail } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin } from "./BrandIcons";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                MP
              </div>
              <span className="text-lg font-bold text-white">
                Mark Philip V. Parayno
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Software Engineer specializing in Mobile (Flutter) & Web Applications.
              Building production-grade solutions for enterprise clients.
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
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
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
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/mark-philip-parayno/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:paraynomarkphilip@gmail.com"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              paraynomarkphilip@gmail.com
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-slate-400">
            © {currentYear} Mark Philip V. Parayno. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-slate-400">
            Built with <Heart size={14} className="text-red-500" /> using React, TypeScript
            & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
