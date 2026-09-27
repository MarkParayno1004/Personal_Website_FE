import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Menu,
  X,
  Shield,
  LogOut,
  User,
  ChevronDown,
  FolderTree,
} from "lucide-react";

interface NavLinkItem {
  href: string;
  label: string;
}

const navLinks: NavLinkItem[] = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPortal =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/categories");

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a192f]/85 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-[#233554]/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-2.5 text-xl font-bold text-white hover:text-amber-400 transition-colors"
          >
            <div className="w-8 h-8 bg-[#112240] rounded-lg flex items-center justify-center text-amber-400 text-sm font-bold border border-amber-500/30 shadow-md shadow-amber-500/10">
              MP
            </div>
            {isAdminPortal ? "Admin Portal" : "Mark Philip"}
          </Link>

          {/* Desktop Nav Links */}
          {!isAdminPortal && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="group px-3 py-2 text-sm font-medium text-[#8892b0] hover:text-amber-400 rounded-lg hover:bg-amber-500/5 transition-all duration-200"
                >
                  <span className="text-amber-400/70 font-mono text-xs mr-1">
                    0{i + 1}.
                  </span>
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Admin/Auth Controls */}
          {isAuthenticated && isAdmin && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/15 border border-amber-500/20 transition-all duration-200"
              >
                <User size={16} />
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.first_name}
                </span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#112240] rounded-xl shadow-xl border border-[#233554] py-1 animate-[slideDown_0.2s_ease-out]">
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#e2e8f0] hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    <Shield size={16} />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/categories"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#e2e8f0] hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    <FolderTree size={16} />
                    Categories Manager
                  </Link>
                  {isAdminPortal && (
                    <Link
                      to="/"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#e2e8f0] hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      <User size={16} />
                      View Portfolio
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {!isAdminPortal && (
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-[#8892b0] hover:bg-[#112240] hover:text-amber-400 transition-all"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && !isAdminPortal && (
        <div className="md:hidden bg-[#0a192f]/95 backdrop-blur-xl border-t border-[#233554] animate-[slideDown_0.2s_ease-out]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className="block px-3 py-2.5 text-sm font-medium text-[#8892b0] hover:text-amber-400 rounded-lg hover:bg-amber-500/5 transition-all"
              >
                <span className="text-amber-400/70 font-mono text-xs mr-2">
                  0{i + 1}.
                </span>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
