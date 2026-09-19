import { useState, useEffect, useMemo } from "react";
import client from "../api/client";
import {
  MapPin,
  Mail,
  Phone,
  Download,
  ExternalLink,
  Star,
  GitFork,
  Search,
  Filter,
  Calendar,
  Briefcase,
  GraduationCap,
  Code2,
  Layers,
  Database,
  Cloud,
  Users,
  ChevronRight,
  ThumbsUp,
  ArrowUpRight,
} from "lucide-react";
import {
  GithubIcon as Github,
  LinkedinIcon as Linkedin,
} from "../components/BrandIcons";

/* ─── Static data (fallback when API is unavailable) ─── */
const PROFILE = {
  name: "Mark Philip V. Parayno",
  headline: "Software Engineer | Mobile & Web Applications",
  location: "San Juan City, Philippines",
  email: "paraynomarkphilip@gmail.com",
  phone: "+63 961 312 8973",
  linkedin: "https://www.linkedin.com/in/mark-philip-parayno/",
  github: "https://github.com/MarkParayno1004",
  summary:
    "Results-driven Software Engineer with hands-on production experience building mobile and web applications for a large retail enterprise. Skilled across Flutter, Svelte, React, Django, and Laravel with a passion for clean architecture, performance optimization, and modern developer tooling.",
};

const SKILLS = [
  {
    category: "Languages",
    icon: Code2,
    color: "blue",
    items: ["TypeScript", "JavaScript", "Dart", "Python", "PHP", "HTML", "CSS"],
  },
  {
    category: "Frontend",
    icon: Layers,
    color: "purple",
    items: [
      "React",
      "Svelte",
      "Flutter",
      "Material UI",
      "Tailwind CSS",
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

const EXPERIENCE = [
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

const EDUCATION = [
  {
    degree: "B.S. Information Technology",
    specialization: "Mobile & Web Application",
    school: "National University Philippines, Manila",
    year: "Sep 2024",
    icon: GraduationCap,
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
};

/* ─── Language color badges ─── */
const langColors = {
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

/* ─── Section wrapper ─── */
function Section({ id, children, className = "" }) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-4 w-20 h-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mx-auto" />
    </div>
  );
}

export default function PortfolioPage() {
  const [repos, setRepos] = useState([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Fetch portfolio config
    client
      .get("/portfolio/config")
      .then((res) => setConfig(res.data))
      .catch(() => {});

    //Fetch GitHub repos
    client
      .get("/github/repos", {
        params: { username: "MarkParayno1004", limit: 10 },
      })
      .then((res) => setRepos(res.data))
      .catch(() => {})
      .finally(() => setLoadingRepos(false));
  }, []);

  const profile = useMemo(() => {
    if (!config) return PROFILE;
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
    };
  }, [config]);

  const skills = useMemo(() => {
    if (!config?.skills) return SKILLS;
    if (Array.isArray(config.skills)) return config.skills;
    if (typeof config.skills === "object") {
      const skillCategoryMeta = {
        Languages: { icon: Code2, color: "blue" },
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

  const experience = useMemo(() => {
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

  const education = useMemo(() => {
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

  /* ─── Repo filtering ─── */
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))];
  const filteredRepos = repos.filter((r) => {
    const matchSearch =
      !repoSearch ||
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(repoSearch.toLowerCase());
    const matchLang = !langFilter || r.language === langFilter;
    return matchSearch && matchLang;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-blue-500/25">
            MP
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
            {profile.name || PROFILE.name}
          </h1>
          <p className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-6">
            {profile.headline || PROFILE.headline}
          </p>

          {/* Contact pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <MapPin size={14} />
              {profile.location || PROFILE.location}
            </span>
            <a
              href={`mailto:${profile.email || PROFILE.email}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Mail size={14} />
              {profile.email || PROFILE.email}
            </a>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <Phone size={14} />
              {profile.phone || PROFILE.phone}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
            >
              <Download size={18} />
              Download CV
            </a>
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-xl transition-all duration-200"
            >
              <Mail size={18} />
              Contact Me
            </a>
            <a
              href={profile.linkedin || PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0077B5] hover:bg-[#006399] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#0077B5]/25"
            >
              <Linkedin size={18} />
              LinkedIn
            </a>
            <a
              href={profile.github || PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-slate-800/25"
            >
              <Github size={18} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <Section id="about">
        <SectionHeader title="About Me" subtitle="A brief introduction" />
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8">
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {profile.summary || PROFILE.summary}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ SKILLS ═══ */}
      <Section id="skills" className="bg-slate-50/50 dark:bg-slate-900/50">
        <SectionHeader
          title="Technical Skills"
          subtitle="Technologies and tools I work with"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((group) => {
            const colors = colorMap[group.color] || colorMap.blue;
            const Icon = group.icon || Code2;
            return (
              <div key={group.category} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-xl ${colors.bg}`}>
                    <Icon size={22} className={colors.text} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
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

      {/* ═══ EXPERIENCE ═══ */}
      <Section id="experience">
        <SectionHeader
          title="Professional Experience"
          subtitle="My career journey so far"
        />
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500 via-purple-500 to-slate-300 dark:to-slate-700 hidden md:block" />

            <div className="space-y-8">
              {experience.map((job, idx) => (
                <div key={idx} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="hidden md:flex shrink-0 w-16 items-start justify-center pt-6">
                    <div
                      className={`w-4 h-4 rounded-full border-4 ${
                        job.current
                          ? "border-blue-500 bg-blue-100 dark:bg-blue-900"
                          : "border-slate-400 bg-white dark:bg-slate-800"
                      }`}
                    />
                  </div>
                  {/* Card */}
                  <div className="flex-1 glass-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {job.title}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                          {job.company}
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        <Calendar size={14} />
                        {job.period}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {job.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-slate-600 dark:text-slate-300"
                        >
                          <ChevronRight
                            size={16}
                            className="shrink-0 mt-1 text-blue-500"
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

      {/* ═══ GITHUB PROJECTS ═══ */}
      <Section id="projects" className="bg-slate-50/50 dark:bg-slate-900/50">
        <SectionHeader
          title="GitHub Projects"
          subtitle="Open source work and personal projects"
        />

        {/* Repo Grid */}
        {loadingRepos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {repo.name}
                  </h3>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors"
                  />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {repo.description || "No description available"}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                    {repo.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={14} />
                    {repo.forks}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Github
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <p className="text-slate-500 dark:text-slate-400">
              {repos.length === 0
                ? "Unable to load repositories. Visit GitHub directly."
                : "No repositories match your search."}
            </p>
            {repos.length === 0 && (
              <a
                href={PROFILE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Github size={16} />
                View on GitHub
              </a>
            )}
          </div>
        )}
      </Section>

      {/* ═══ EDUCATION ═══ */}
      <Section id="education" className="bg-slate-50/50 dark:bg-slate-900/50">
        <SectionHeader title="Education" subtitle="Academic background" />
        <div className="max-w-2xl mx-auto">
          {education.map((edu, idx) => (
            <div key={idx} className="glass-card p-6 flex items-start gap-5">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <GraduationCap
                  size={28}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {edu.degree}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {edu.specialization}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  {edu.school}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  {edu.year}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
