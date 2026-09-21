import CategoriesOverview from "../components/categories/CategoriesOverview";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoriesOverview />
      </div>
    </div>
  );
}
