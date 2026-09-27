import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import client from "../api/client";
import {
  MapPin,
  Mail,
  Phone,
  Download,
  Star,
  GitFork,
  Calendar,
  GraduationCap,
  Code2,
  Layers,
  Database,
  Cloud,
  Users,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  GithubIcon as Github,
  LinkedinIcon as Linkedin,
} from "../components/BrandIcons";
import type {
  PortfolioProfile,
  SkillCategory,
  ExperienceItem,
  EducationItem,
  GitHubRepo,
  PortfolioConfig,
} from "../types";

/* ─── Static data (fallback when API is unavailable) ─── */
const PROFILE: PortfolioProfile = {
  name: "Mark Philip V. Parayno",
  headline: "Software Engineer | Full Stack & Mobile Developer (Flutter)",
  location: "San Juan City, Philippines",
  email: "paraynomarkphilip@gmail.com",
  phone: "+63 961 312 8973",
  linkedin: "https://www.linkedin.com/in/mark-philip-parayno/",
  github: "https://github.com/MarkParayno1004",
  summary:
    "Results-driven Software Engineer, Full Stack and Mobile Developer with hands-on production experience building cross-platform mobile apps (Flutter) and web applications (React, TypeScript, Svelte, Django, Laravel). Skilled in clean architecture, API optimization, and scalable cloud solutions.",
};

const SKILLS: SkillCategory[] = [
  {
    category: "Languages",
    icon: Code2,
    color: "blue",
    items: ["TypeScript", "JavaScript", "Dart", "Python", "PHP", "HTML", "CSS"],
  },
  {
    category: "Mobile",
    icon: Layers,
    color: "cyan",
    items: [
      "Flutter",
      "Dart",
      "Cross-Platform",
      "Mobile Architecture",
      "State Management",
      "APK/Testing Builds",
    ],
  },
  {
    category: "Frontend",
    icon: Layers,
    color: "purple",
    items: [
      "React",
      "Svelte",
      "Tailwind CSS",
      "Material UI",
      "Bootstrap",
    ],
  },
  {
    category: "Backend",
    icon: Database,
    color: "green",
    items: ["Django", "Laravel", "GraphQL", "REST APIs"],
  },
  {
    category: "Data",
    icon: Database,
    color: "amber",
    items: ["PostgreSQL", "MongoDB", "Firebase"],
  },
  {
    category: "Cloud & DevOps",
    icon: Cloud,
    color: "cyan",
    items: ["AWS", "Jenkins", "CircleCI", "CI/CD"],
  },
  {
    category: "Practices",
    icon: Users,
    color: "rose",
    items: [
      "Agile/Scrum",
      "Code Review",
      "AI-assisted development (Cursor, Gemini)",
    ],
  },
];

const EXPERIENCE: ExperienceItem[] = [
  {
    title: "Software Specialist",
    company: "Shopping Center Management Corporation (SM Prime Holdings, Inc.)",
    period: "Sep 2024 - Present",
    current: true,
    bullets: [
      "Centralized image asset database in Laravel with file conversion & import/export features.",
      "Svelte microsites and e-commerce platform capabilities.",
      "Financial app refactoring, eliminating N+1 queries, reducing API response times.",
      "Internal CMS application support, Jenkins & CircleCI CI/CD pipeline management.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "Shopping Center Management Corporation (SM Prime Holdings, Inc.)",
    period: "Dec 2023 - May 2024",
    current: false,
    bullets: [
      "Mobile and web application maintenance, Flutter/Dart refactoring, APK testing builds.",
      "Collaborated with senior engineers on feature development and code reviews.",
    ],
  },
  {
    title: "IT Support Intern",
    company: "National University",
    period: "May 2024 - Jun 2024",
    current: false,
    bullets: [
      "Hardware/software support, enrollment ID systems, computer lab maintenance.",
      "Assisted faculty and students with technical troubleshooting and system setup.",
    ],
  },
];

const EDUCATION: EducationItem[] = [
  {
    degree: "B.S. Information Technology",
    specialization: "Mobile & Web Application",
    school: "National University Philippines, Manila",
    year: "Sep 2024",
    icon: GraduationCap,
  },
];

/* ─── Warm color map for skills ─── */
const colorMap: Record<
  string,
  { bg: string; text: string; border: string; badge: string }
> = {
  blue: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-300 border border-amber-500/15",
  },
  purple: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/20",
    badge: "bg-violet-500/10 text-violet-300 border border-violet-500/15",
  },
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/15",
  },
  amber: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    badge: "bg-orange-500/10 text-orange-300 border border-orange-500/15",
  },
  cyan: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
    badge: "bg-teal-500/10 text-teal-300 border border-teal-500/15",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    badge: "bg-rose-500/10 text-rose-300 border border-rose-500/15",
  },
};

/* ─── Language color badges ─── */
const langColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Dart: "#00b4ab",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#239120",
  Shell: "#89e051",
  Svelte: "#ff3e00",
};

/* ─── Scroll reveal hook ─── */
function useScrollReveal() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      document
        .querySelectorAll(".reveal, .reveal-children")
        .forEach((el) => observer.observe(el));
    });

    return () => observer.disconnect();
  }, []);
}

/* ─── Section wrapper ─── */
function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/* ─── Numbered section header ─── */
function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="reveal mb-14">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-amber-400 font-mono text-lg font-medium">
          {number}.
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
        <div className="flex-1 h-px bg-[#233554] hidden md:block" />
      </div>
      {subtitle && (
        <p className="text-[#8892b0] text-lg ml-0 md:ml-10">{subtitle}</p>
      )}
    </div>
  );
}

export default function PortfolioPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [config, setConfig] = useState<PortfolioConfig | null>(null);

  // Activate scroll-reveal animations
  useScrollReveal();

  useEffect(() => {
    // Fetch portfolio config
    client
      .get("/portfolio/config")
      .then((res) => setConfig(res.data))
      .catch(() => {});

    // Fetch GitHub repos
    client
      .get("/github/repos", {
        params: { username: "MarkParayno1004", limit: 10 },
      })
      .then((res) => {
        const repoList: GitHubRepo[] = (res.data || []).map((r: Record<string, unknown>) => ({
          id: Number(r.id),
          name: String(r.name || ""),
          html_url: String(r.html_url || ""),
          description: r.description ? String(r.description) : null,
          language: r.language ? String(r.language) : null,
          stars: typeof r.stars === "number" ? r.stars : Number(r.stargazers_count || 0),
          forks: typeof r.forks === "number" ? r.forks : Number(r.forks_count || 0),
        }));
        setRepos(repoList);
      })
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, []);

  const profile: PortfolioProfile = useMemo(() => {
    const avatar =
      config?.avatar_url ||
      config?.avatar ||
      config?.image ||
      config?.image_url ||
      config?.profile_image ||
      localStorage.getItem("portfolio_avatar") ||
      "";

    if (!config) return { ...PROFILE, avatar };
    return {
      name: config.full_name || config.name || PROFILE.name,
      headline: config.headline || PROFILE.headline,
      location: config.location || PROFILE.location,
      email: config.email || PROFILE.email,
      phone: config.phone || PROFILE.phone,
      linkedin: config.linkedin_url || config.linkedin || PROFILE.linkedin,
      github: config.github_username
        ? config.github_username.startsWith("http")
          ? config.github_username
          : `https://github.com/${config.github_username}?tab=repositories`
        : config.github || PROFILE.github,
      summary: config.about_summary || config.summary || PROFILE.summary,
      avatar,
    };
  }, [config]);

  const skills: SkillCategory[] = useMemo(() => {
    if (!config?.skills) return SKILLS;
    if (Array.isArray(config.skills)) return config.skills;
    if (typeof config.skills === "object") {
      const skillCategoryMeta: Record<
        string,
        { icon: typeof Code2; color: string }
      > = {
        Languages: { icon: Code2, color: "blue" },
        Mobile: { icon: Layers, color: "cyan" },
        Frontend: { icon: Layers, color: "purple" },
        Backend: { icon: Database, color: "green" },
        Data: { icon: Database, color: "amber" },
        "Cloud & DevOps": { icon: Cloud, color: "cyan" },
        Practices: { icon: Users, color: "rose" },
      };
      return Object.entries(config.skills).map(([category, items]) => ({
        category,
        icon: skillCategoryMeta[category]?.icon || Code2,
        color: skillCategoryMeta[category]?.color || "blue",
        items: Array.isArray(items) ? items : [],
      }));
    }
    return SKILLS;
  }, [config]);

  const experience: ExperienceItem[] = useMemo(() => {
    if (
      !config?.experience ||
      !Array.isArray(config.experience) ||
      config.experience.length === 0
    ) {
      return EXPERIENCE;
    }
    return config.experience.map((job) => ({
      title: job.role || job.title || "",
      company: job.company || "",
      period: job.period || "",
      current:
        job.period?.toLowerCase().includes("present") ?? job.current ?? false,
      bullets: Array.isArray(job.bullets) ? job.bullets : [],
    }));
  }, [config]);

  const education: EducationItem[] = useMemo(() => {
    if (
      !config?.education ||
      !Array.isArray(config.education) ||
      config.education.length === 0
    ) {
      return EDUCATION;
    }
    return config.education.map((edu) => ({
      degree: edu.degree || "",
      specialization: edu.specialization || "",
      school: edu.institution || edu.school || "",
      year: edu.graduation_date || edu.year || "",
      icon: edu.icon || GraduationCap,
    }));
  }, [config]);

  // Dynamically sync document title when backend profile data is loaded
  useEffect(() => {
    if (profile.name && profile.headline) {
      document.title = `${profile.name} | ${profile.headline}`;
    }
  }, [profile]);

  /* ─── Repos ─── */
  const filteredRepos = repos;

  return (
    <main className="min-h-screen bg-[#0a192f] text-[#e2e8f0]">
      {/* ═══════════════════════════════════════════════
          HERO — Left-aligned, warm, confident
      ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-[#0a192f]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-amber-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px]" />

        {/* Floating decorative dots */}
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-float" />
        <div className="absolute top-[30%] right-[15%] w-2 h-2 rounded-full bg-teal-400/30 animate-float-slow" />
        <div className="absolute bottom-[25%] left-[20%] w-1 h-1 rounded-full bg-amber-400/30 animate-float-slower" />
        <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 rounded-full bg-violet-400/25 animate-float" />
        <div className="absolute bottom-[35%] right-[10%] w-1 h-1 rounded-full bg-teal-400/20 animate-float-slow" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Text content (takes 3 cols) */}
            <div className="lg:col-span-3 animate-slide-up">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                Available for opportunities
              </div>

              <p className="text-[#8892b0] font-mono text-base mb-4">
                Hi, my name is
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                <span className="text-white">{(profile.name || PROFILE.name).split(" ").slice(0, -1).join(" ")}</span>
                <br />
                <span className="text-amber-400">
                  {(profile.name || PROFILE.name).split(" ").slice(-1)[0]}.
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-[#8892b0] font-medium mb-6 max-w-xl">
                {profile.headline || PROFILE.headline}
              </p>

              {/* Contact pills */}
              <div className="flex flex-wrap items-center gap-2.5 text-sm text-[#8892b0] mb-8">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#112240] border border-[#233554]">
                  <MapPin size={14} className="text-amber-400" />
                  {profile.location || PROFILE.location}
                </span>
                <a
                  href={`mailto:${profile.email || PROFILE.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#112240] border border-[#233554] hover:border-amber-500/30 hover:text-amber-300 transition-colors"
                >
                  <Mail size={14} className="text-amber-400" />
                  {profile.email || PROFILE.email}
                </a>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#112240] border border-[#233554]">
                  <Phone size={14} className="text-amber-400" />
                  {profile.phone || PROFILE.phone}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-7 py-3 bg-amber-500 hover:bg-amber-600 text-[#0a192f] font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98]"
                >
                  <Download size={18} />
                  Download CV
                </a>
                <a
                  href={profile.linkedin || PROFILE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-medium rounded-lg transition-all duration-200"
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
                <a
                  href={profile.github || PROFILE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3 border border-[#233554] text-[#e2e8f0] hover:border-amber-500/30 hover:text-amber-400 font-medium rounded-lg transition-all duration-200"
                >
                  <Github size={18} />
                  GitHub
                </a>
              </div>
            </div>

            {/* Right: Avatar decoration (takes 2 cols) */}
            <div className="hidden lg:flex lg:col-span-2 justify-center">
              <div className="relative">
                {/* Main avatar box */}
                <div className="w-72 h-72 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-black/40">
                  {profile.avatar ? (
                    <>
                      <img
                        src={profile.avatar}
                        alt={profile.name || "Profile"}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </>
                  ) : (
                    <>
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="text-8xl font-bold text-amber-400/20 group-hover:text-amber-400/30 transition-colors duration-500 select-none">
                        {(profile.name || "Mark Philip")
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </>
                  )}
                </div>
                {/* Decorative offset border */}
                <div className="absolute -top-4 -right-4 w-72 h-72 rounded-2xl border-2 border-amber-500/20 -z-10" />
                {/* Corner sparkle */}
                <div className="absolute -top-2 -right-2 text-amber-400/50">
                  <Sparkles size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8892b0] animate-bounce">
          <span className="text-xs font-mono">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-amber-400/50 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT
      ═══════════════════════════════════════════════ */}
      <Section id="about">
        <SectionHeader
          number="01"
          title="About Me"
          subtitle="A brief introduction"
        />
        <div className="max-w-3xl reveal">
          <div className="glass-card p-8 accent-left">
            <p className="text-lg leading-relaxed text-[#8892b0]">
              {profile.summary || PROFILE.summary}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          SKILLS
      ═══════════════════════════════════════════════ */}
      <Section id="skills" className="bg-[#112240]/30">
        <SectionHeader
          number="02"
          title="Technical Skills"
          subtitle="Technologies and tools I work with"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-children">
          {skills.map((group) => {
            const colors = colorMap[group.color] || colorMap.blue;
            const Icon = group.icon || Code2;
            return (
              <div key={group.category} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2.5 rounded-xl ${colors.bg} border ${colors.border}`}
                  >
                    <Icon size={22} className={colors.text} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {group.category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          EXPERIENCE
      ═══════════════════════════════════════════════ */}
      <Section id="experience">
        <SectionHeader
          number="03"
          title="Professional Experience"
          subtitle="My career journey so far"
        />
        <div className="max-w-4xl">
          <div className="relative">
            {/* Timeline line — amber gradient */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/60 via-amber-500/30 to-[#233554] hidden md:block" />

            <div className="space-y-8 reveal-children">
              {experience.map((job, idx) => (
                <div key={idx} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-6">
                    <div
                      className={`w-4 h-4 rounded-full border-4 ${
                        job.current
                          ? "border-amber-500 bg-amber-900/50 shadow-md shadow-amber-500/30"
                          : "border-[#233554] bg-[#112240]"
                      }`}
                    />
                  </div>
                  {/* Card */}
                  <div className="flex-1 glass-card p-6 accent-left">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {job.title}
                        </h3>
                        <p className="text-amber-400 font-medium">
                          {job.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.current && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium">
                            Current
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-[#8892b0] bg-[#112240] px-3 py-1 rounded-full border border-[#233554]">
                          <Calendar size={14} />
                          {job.period}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {job.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-[#8892b0]"
                        >
                          <ChevronRight
                            size={16}
                            className="shrink-0 mt-1 text-amber-400"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════
          GITHUB PROJECTS
      ═══════════════════════════════════════════════ */}
      <Section id="projects" className="bg-[#112240]/30">
        <SectionHeader
          number="04"
          title="GitHub Projects"
          subtitle="Open source work and personal projects"
        />

        {/* Repo Grid */}
        {loadingRepos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-5 bg-[#233554] rounded w-3/4 mb-3" />
                <div className="h-4 bg-[#233554] rounded w-full mb-2" />
                <div className="h-4 bg-[#233554] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-children">
            {filteredRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                    {repo.name}
                  </h3>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-[#8892b0] group-hover:text-amber-400 transition-colors"
                  />
                </div>
                <p className="text-sm text-[#8892b0] mb-4 line-clamp-2">
                  {repo.description || "No description available"}
                </p>
                <div className="flex items-center gap-4 text-sm text-[#8892b0]">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            langColors[repo.language] || "#6b7280",
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={14} />
                    {repo.stars || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={14} />
                    {repo.forks || 0}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 reveal">
            <Github
              size={48}
              className="mx-auto text-[#233554] mb-4"
            />
            <p className="text-[#8892b0]">
              {repos.length === 0
                ? "Unable to load repositories. Visit GitHub directly."
                : "No repositories match your search."}
            </p>
            {repos.length === 0 && (
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-amber-400 hover:underline"
              >
                <Github size={16} />
                View on GitHub
              </a>
            )}
          </div>
        )}
      </Section>

      {/* ═══════════════════════════════════════════════
          EDUCATION
      ═══════════════════════════════════════════════ */}
      <Section id="education">
        <SectionHeader
          number="05"
          title="Education"
          subtitle="Academic background"
        />
        <div className="max-w-2xl reveal-children">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="glass-card p-6 flex items-start gap-5 accent-left"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <GraduationCap size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                <p className="text-amber-400 font-medium">
                  {edu.specialization}
                </p>
                <p className="text-[#8892b0] mt-1">{edu.school}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#8892b0]">
                  <Calendar size={14} />
                  {edu.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
