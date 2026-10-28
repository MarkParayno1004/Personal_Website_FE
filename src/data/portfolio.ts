import { Code2, Layers, Database, Cloud, GraduationCap } from "lucide-react";
import type {
  PortfolioProfile,
  SkillCategory,
  ExperienceItem,
  EducationItem,
} from "../types";
import avatar from "./avatar.jpg";

export const PROFILE: PortfolioProfile = {
  name: "Mark Philip V. Parayno",
  avatar,
  headline: "Software Engineer | Full Stack & Mobile Developer (Flutter)",
  location: "San Juan City, Philippines",
  email: "paraynomarkphilip@gmail.com",
  phone: "+63 961 312 8973",
  linkedin: "https://www.linkedin.com/in/mark-philip-parayno/",
  github: "https://github.com/MarkParayno1004",
  summary:
    "Results-driven Software Engineer, Full Stack and Mobile Developer with hands-on production experience building cross-platform mobile apps (Flutter) and web applications (React, TypeScript, Svelte, Django, Laravel). Skilled in clean architecture, API optimization, and scalable cloud solutions.",
};

export const SKILLS: SkillCategory[] = [
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
    items: ["React", "Svelte", "Tailwind CSS", "Material UI", "Bootstrap"],
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
];

export const EXPERIENCE: ExperienceItem[] = [
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

export const EDUCATION: EducationItem[] = [
  {
    degree: "B.S. Information Technology",
    specialization: "Mobile & Web Application",
    school: "National University Philippines, Manila",
    year: "Sep 2024",
    icon: GraduationCap,
  },
];
