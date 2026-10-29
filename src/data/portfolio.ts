import { Code2, Layers, Database, Cloud, GraduationCap } from "lucide-react";
import type {
  PortfolioProfile,
  SkillCategory,
  ExperienceItem,
  EducationItem,
} from "../types";

export const PROFILE: PortfolioProfile = {
  name: "Mark Philip V. Parayno",
  // Served from public/ so og:image can point at a stable, unhashed URL.
  avatar: "/avatar.jpg",
  headline: "Software Engineer · Mobile & Web Applications",
  location: "San Juan City, Philippines",
  email: "paraynomarkphilip@gmail.com",
  phone: "+63 961 312 8973",
  linkedin: "https://www.linkedin.com/in/mark-philip-parayno/",
  github: "https://github.com/MarkParayno1004",
  summary:
    "Software Engineer with 2+ years building and shipping production mobile and web apps for a high-traffic retail e-commerce ecosystem. Full-stack across Flutter, Svelte, React, and Django, from customer-facing features and UX fixes to backend performance work such as eliminating N+1 queries to cut API response times. Owns CI/CD with Jenkins and CircleCI, and uses AI-assisted tooling to ship faster without compromising code quality.",
};

export const SKILLS: SkillCategory[] = [
  {
    category: "Languages",
    icon: Code2,
    color: "blue",
    items: ["TypeScript", "JavaScript", "Dart", "Python", "HTML", "CSS"],
  },
  {
    category: "Mobile",
    icon: Layers,
    color: "cyan",
    items: ["Flutter", "Cross-Platform", "APK/Testing Builds"],
  },
  {
    category: "Frontend",
    icon: Layers,
    color: "purple",
    items: ["React", "Svelte", "Material UI", "Tailwind CSS", "Bootstrap"],
  },
  {
    category: "Backend",
    icon: Database,
    color: "green",
    items: ["Django", "REST APIs", "GraphQL"],
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
    items: ["AWS", "Jenkins", "CircleCI", "CI/CD pipelines"],
  },
  {
    category: "Practices",
    icon: Code2,
    color: "blue",
    items: [
      "Agile/Scrum",
      "Code review",
      "Performance tuning",
      "AI-assisted development (Cursor, Gemini)",
    ],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    title: "Software Specialist",
    company: "Shopping Center Management Corporation (SM Prime Holdings, Inc.)",
    period: "Sep 2024 - Present",
    current: true,
    bullets: [
      "Build and maintain mobile and web apps (Flutter, Svelte, React, Django) powering a high-traffic retail e-commerce ecosystem.",
      "Ship new capabilities, production fixes, and UX improvements on the Svelte microsites of the company's e-commerce platform.",
      "Boosted financial app performance by refactoring legacy code and eliminating N+1 queries, reducing database load and API response times.",
      "Keep the internal CMS apps behind the mobile e-commerce platform reliable, so operations teams can publish content without disruption.",
      "Own Jenkins and CircleCI deployments, keeping builds, tests, and releases consistent and repeatable.",
      "Accelerate feature delivery, refactoring, and debugging with Cursor and Gemini while upholding code review and quality standards.",
      "Contribute across the full Agile cycle: sprint planning, backlog refinement, stand-ups, reviews, and retrospectives.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "Shopping Center Management Corporation (SM Prime Holdings, Inc.)",
    period: "Dec 2023 - May 2024",
    current: false,
    bullets: [
      "Delivered features and maintenance across mobile and web applications within an Agile engineering team.",
      "Refactored Flutter/Dart codebases for readability and stability, and produced APK builds for smoother QA handoff.",
      "Took part in brainstorming, code reviews, and end-to-end testing with QA throughout each sprint.",
    ],
  },
  {
    title: "IT Support Intern",
    company: "National University",
    period: "May 2024 - Jun 2024",
    current: false,
    bullets: [
      "Resolved hardware and software issues for faculty and staff, minimizing downtime during academic operations.",
      "Supported enrollment by issuing and updating IDs; maintained computer labs for classes, meetings, and presentations.",
    ],
  },
];

export const EDUCATION: EducationItem[] = [
  {
    degree: "B.S. Information Technology",
    specialization: "Mobile & Web Applications",
    school: "National University Philippines, Manila",
    year: "Sep 2024",
    icon: GraduationCap,
  },
];
