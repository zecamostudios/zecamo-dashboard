"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { TweaksDrawer } from "./TweaksDrawer";

interface ShellClientProps {
  children: React.ReactNode;
  tasksCount: number;
  prospectsCount: number;
}

export function ShellClient({ children, tasksCount, prospectsCount }: ShellClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={[
          "fixed inset-y-0 left-0 z-50 w-[252px] shrink-0 transition-transform duration-300 ease-in-out",
          "md:relative md:translate-x-0 md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar
          tasksCount={tasksCount}
          prospectsCount={prospectsCount}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <div className="px-4 md:px-8 py-5 md:py-7 pb-20 max-w-[1520px] w-full">
          {children}
        </div>
      </div>

      <TweaksDrawer />
    </div>
  );
}
