// app/(authenticated)/layout.tsx
import type React from "react";
import { Header } from "@/components/header";
import SidebarWrapper from "./SidebarWrapper";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarWrapper />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}