"use client"

import React from "react"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { LogoMarquee } from "@/components/logo-marquee"
import { BentoGrid } from "@/components/bento-grid"
import { Pricing } from "@/components/pricing"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

interface LandingPageProps {
  onEnterDemo: () => void
}

export function LandingPage({ onEnterDemo }: LandingPageProps) {
  return (
    <SmoothScroll>
      <main className="min-h-[100dvh] bg-zinc-950 text-white selection:bg-zinc-800 selection:text-white">
        <Navbar onEnterDemo={onEnterDemo} />
        <Hero onEnterDemo={onEnterDemo} />
        {/* <LogoMarquee /> */}
        <BentoGrid />
        <Pricing onEnterDemo={onEnterDemo} />
        <FinalCTA onEnterDemo={onEnterDemo} />
        <Footer />
      </main>
    </SmoothScroll>
  )
}

export default LandingPage
