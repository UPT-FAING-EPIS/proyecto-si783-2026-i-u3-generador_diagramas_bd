'use client';

import Navbar from "@/components/landing/Navbar";
import DesktopAppSection from "@/components/landing/DesktopAppSection";
import DesktopFlow from "@/components/landing/DesktopFlow";
import DesktopFeatures from "@/components/landing/DesktopFeatures";
import Footer from "@/components/landing/Footer";

export default function DesktopPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-10">
        <DesktopAppSection />
        <DesktopFlow />
        <DesktopFeatures />
      </div>
      <Footer />
    </main>
  );
}
