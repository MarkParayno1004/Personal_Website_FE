import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import CategoriesOverview from "../components/categories/CategoriesOverview";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#15121c] text-[#ece8f4] pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f1a2b] hover:bg-amber-500/10 border border-[#342c45] hover:border-amber-500/30 text-[#a59cb8] hover:text-amber-400 font-medium rounded-xl transition-all duration-200 group text-sm shadow-md"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform text-amber-400"
            />
            <Home size={14} className="text-amber-400" />
            <span>Back to Admin</span>
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f1a2b] hover:bg-[#2a2339] border border-[#342c45] text-[#a59cb8] hover:text-white font-medium rounded-xl transition-all duration-200 text-sm"
          >
            <span>Admin Dashboard</span>
          </Link>
        </div>

        <CategoriesOverview />
      </div>
    </div>
  );
}
