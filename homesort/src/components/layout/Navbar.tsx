import { Home } from "lucide-react";
type NavbarProps = {
  title: string;
  role: "admin" | "resident";
};

export default function Navbar({ role }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between bg-brand-accent text-brand-white border-b border-brand-accent/20 px-6 shadow-md sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <Home className="w-10 h-10" />
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Homesort
        </h1>
      </div>

      <div className="flex items-center gap-5">
        <span className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
          {role === "admin" ? "Admin" : "Resident"}
        </span>

        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-accent shadow-md transition-transform hover:scale-105 hover:bg-gray-50">
          U
        </button>
      </div>
    </header>
  );
}
