"use client";

import { Navbar } from "@/components/navbar";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="pb-10">{children}</div>
    </>
  );
}
