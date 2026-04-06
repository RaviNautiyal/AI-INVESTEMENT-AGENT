"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiBarChartLine,
  RiNewspaperLine,
  RiRobot2Line,
  RiStockLine,
  RiPieChartLine,
  RiEyeLine,
  RiLogoutBoxLine,
  RiNotification2Line,
  RiScales3Line,
  RiLineChartLine,
  RiGlobalLine,
  RiVipCrownLine
} from "react-icons/ri";


const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: RiDashboardLine },
  { href: "/market", label: "Market", icon: RiGlobalLine },
  { href: "/portfolio", label: "Portfolio", icon: RiBriefcaseLine },
  { href: "/watchlist", label: "Watchlist", icon: RiEyeLine },
  { href: "/alerts", label: "Alerts", icon: RiNotification2Line },
  { href: "/charts", label: "Charts", icon: RiLineChartLine },
  { href: "/compare", label: "Compare", icon: RiScales3Line },
  { href: "/analysis", label: "Analysis", icon: RiBarChartLine },
  { href: "/optimize", label: "Optimizer", icon: RiPieChartLine },
  { href: "/screener", label: "Screener", icon: RiStockLine },
  { href: "/news", label: "News", icon: RiNewspaperLine },
  { href: "/ai", label: "AI Advisor", icon: RiRobot2Line },
  { href: "/pricing", label: "Upgrade Pro", icon: RiVipCrownLine }
];
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("email");
    if (stored) setEmail(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    router.push("/login");
  };

const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/";

  if (isAuthPage) return null;
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d0d14] border-r border-[#1a1a2e] flex flex-col z-50">

      {/* Logo */}
      <div className="p-6 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            Q
          </div>
          <div>
            <p className="text-white font-bold text-sm">QuantAI</p>
            <p className="text-gray-500 text-xs">Investment Platform</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a2e]"
              }`}
            >
              <Icon className="text-lg" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-[#1a1a2e]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {email.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-400 text-xs truncate flex-1">{email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-[#1a1a2e] transition-all w-full"
        >
          <RiLogoutBoxLine className="text-lg" />
          Logout
        </button>
      </div>

    </aside>
  );
}