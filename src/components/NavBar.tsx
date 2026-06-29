import { Link, useRouterState } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Atlas" },
  { to: "/facilities", label: "Facilities" },
  { to: "/methodology", label: "Methodology" },
] as const;

export function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-[1000] border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-12 items-center px-4 gap-6">
        <Link to="/" className="font-bold tracking-tight text-teal text-sm">
          Fab<span className="text-foreground">Pressure</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <span className="ml-auto text-[11px] text-muted-foreground hidden sm:inline">
          Data current as of June 2026
        </span>
      </div>
    </header>
  );
}
