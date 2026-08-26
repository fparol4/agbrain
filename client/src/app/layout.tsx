import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, Sprout, User as UserIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { producersApi } from "@/modules/producers/api";
import { getScopedPath } from "@/app/producer-scope";
import { useAuth } from "@/modules/auth/use-auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", scoped: true },
  { label: "Produtores", path: "/producers", scoped: false },
  { label: "Fazendas", path: "/farms", scoped: true },
  { label: "Safras", path: "/harvests", scoped: true },
  { label: "Auditoria", path: "/audit", scoped: false },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isScopedRoute = ["/dashboard", "/farms", "/harvests"].some((r) =>
    location.pathname.startsWith(r),
  );
  const currentProducerId = searchParams.get("idProducer") || "all";

  const { data: producersData } = useQuery({
    queryKey: ["producers", "active-list"],
    queryFn: () => producersApi.list({ status: "ACTIVE", limit: 100 }),
    staleTime: 60_000,
  });

  const handleProducerScopeChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("idProducer");
    } else {
      newParams.set("idProducer", value);
    }
    setSearchParams(newParams);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="border-border bg-card sticky top-0 z-40 w-full border-b">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              to={getScopedPath("/dashboard", location.search)}
              className="text-foreground flex items-center gap-2 text-lg font-bold transition-opacity hover:opacity-90"
            >
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded text-sm font-semibold">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="tracking-tight">ag-brain</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const targetPath = item.scoped
                  ? getScopedPath(item.path, location.search)
                  : item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={targetPath}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-secondary text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Producer Scope & User menu */}
          <div className="flex items-center gap-3">
            {isScopedRoute && (
              <div className="w-[180px] sm:w-[220px]">
                <Select value={currentProducerId} onValueChange={handleProducerScopeChange}>
                  <SelectTrigger className="bg-background border-border h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Todos os produtores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os produtores</SelectItem>
                    {producersData?.data.map((p) => (
                      <SelectItem key={p.idProducer} value={p.idProducer}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Desktop User Menu */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border h-9 gap-2 px-3">
                    <UserIcon className="text-muted-foreground h-4 w-4" />
                    <span className="max-w-[120px] truncate text-xs font-medium">
                      {user?.name || "Administrador"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">{user?.name}</p>
                      <p className="text-muted-foreground text-xs leading-none">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile navigation stays in the top bar too; it never becomes a side panel. */}
            <div className="flex md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu de navegação</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navItems.map((item) => {
                    const targetPath = item.scoped
                      ? getScopedPath(item.path, location.search)
                      : item.path;
                    return (
                      <DropdownMenuItem key={item.path} asChild>
                        <NavLink to={targetPath}>{item.label}</NavLink>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="truncate text-xs font-normal">
                    {user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
