"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {ArrowRight } from "lucide-react";
import Link from "next/link";
import LogoDakries from "../assets/images/logo-dakries-cafe.png";

import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {

  const profile = useAuthStore((state) => state.profile);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyan accent background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/30 via-neutral-950 to-neutral-950" />
      <div className="absolute top-1/3 left-1/5 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse duration-[6s]" />
      <div className="absolute bottom-1/3 right-1/5 w-72 h-72 bg-cyan-400/3 rounded-full blur-3xl animate-pulse duration-[8s] delay-1000" />

      {/* Subtle grid overlay with cyan tint */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <Card className="w-full max-w-md bg-neutral-900/70 backdrop-blur-2xl border-neutral-800/40 shadow-2xl relative z-10 overflow-hidden">
        {/* Cyan top border accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

        <CardHeader className="text-center pb-6 pt-10 px-8">
          {/* Logo container with cyan accent */}
          <div className="mx-auto mb-8 relative">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg border border-cyan-500/20 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              <Image src={LogoDakries} alt="Logo" width={80} height={80} />
            </div>
            {/* Cyan glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl blur-xl scale-125 -z-10" />
          </div>

          <CardTitle className="text-2xl font-light text-white mb-1 tracking-wide">
            Dakries Café & Resto
          </CardTitle>

          {/* Cyan divider */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent mx-auto mb-3" />

          <p className="text-neutral-400 text-xs font-normal tracking-[0.2em] uppercase">
            Point of Sale System
          </p>
        </CardHeader>

        <CardContent className="text-center space-y-6 pb-10 px-8">
          {/* User greeting with clean white text */}
          <div className="space-y-1">
            <p className="text-neutral-400 text-medium font-normal tracking-wide">
              Welcome back,
            </p>
            <p className="text-2xl font-medium text-white">{profile.name}</p>
          </div>

          {/* Cyan CTA Button */}
          <Link href={profile.role === 'manager' ? '/manager' : '/order' } className="block">
            <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 text-sm py-5 rounded-lg group shadow-lg hover:shadow-cyan-500/20 hover:shadow-xl font-normal tracking-wide relative overflow-hidden">
              {/* Button shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />

              <span className="flex items-center justify-center gap-3 relative z-10">
                Access Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>

          {/* Clean footer */}
          <p className="text-white text-xs mt-8">
            © 2026 Dakries Café & Resto. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
