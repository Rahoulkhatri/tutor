"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Zap, CreditCard, Clock, Wallet, TrendingUp, Lightbulb, Star, Settings, HelpCircle } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: BookOpen, label: "Teachers", href: "/teachers" },
  { icon: Zap, label: "Matches", href: "/matches" },
];

const menuItems2 = [
  { icon: CreditCard, label: "Transactions", href: "/transactions" },
  { icon: Clock, label: "Schedule", href: "/schedule" },
  { icon: Wallet, label: "Payouts", href: "/payouts" },
];

const menuItems3 = [
  { icon: TrendingUp, label: "Performance", href: "/performance" },
  { icon: Lightbulb, label: "Site Insights", href: "/site-insights" },
  { icon: Star, label: "Ratings", href: "/ratings" },
];

const menuItems4 = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help & Support", href: "/help" },
];

function NavLinks({
  items,
}: {
  items: { icon: typeof LayoutDashboard; label: string; href: string }[];
}) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-secondary text-foreground font-medium"
                : "text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-border p-6 h-screen overflow-y-auto shrink-0">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          T
        </div>
        <span className="font-bold text-lg">TutorConnect</span>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            MENU
          </p>
          <NavLinks items={menuItems} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            MANAGE
          </p>
          <NavLinks items={menuItems2} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            ANALYZE
          </p>
          <NavLinks items={menuItems3} />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            SETTINGS
          </p>
          <NavLinks items={menuItems4} />
        </div>
      </div>
    </aside>
  );
}
