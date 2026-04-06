"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const publicPages = ["/", "/login", "/signup"];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = publicPages.includes(pathname);

  return (
    <>
      {!isPublic && <Sidebar />}
      <main className={!isPublic ? "ml-60 min-h-screen" : ""}>
        {children}
      </main>
    </>
  );
}