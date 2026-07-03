"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position to change nav bar styling on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background w-full text-on-surface font-sans selection:bg-secondary-container selection:text-on-secondary-container overflow-x-hidden">
      <nav
        className={`fixed top-0 left-0 w-full z-sticky-header border-b transition-all duration-base ease-standard ${
          scrollPosition > 20
            ? "bg-white/80 backdrop-blur-md border-outline-variant shadow-sm"
            : "bg-transparent border-transparent"
        }`}
        id="main-nav"
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-16 flex justify-between items-center">
          <div className="flex items-center gap-stack-sm select-none">
            <span className="material-symbols-outlined text-secondary text-[28px] leading-none" aria-hidden="true">
              real_estate_agent
            </span>
            <span className="text-headline-md text-primary font-bold">RentFlow</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-stack-lg">
            <a
              className="text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded"
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
            >
              Features
            </a>
            <a
              className="text-label-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded"
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
            >
              Testimonials
            </a>
            <Link
              className="text-label-md text-primary hover:text-secondary transition-colors font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded px-2 py-1"
              href="/login"
            >
              Log In
            </Link>
            <Link
              className="bg-primary text-on-primary text-label-md px-4 py-2 rounded-sm font-semibold hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
              href="/signup"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface p-2 rounded-full hover:bg-surface-container-high transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined leading-none" aria-hidden="true">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-outline-variant shadow-md p-6 flex flex-col gap-4 animate-[slideDown_150ms_ease-out]">
            <a
              className="text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
            >
              Features
            </a>
            <a
              className="text-body-lg text-on-surface-variant hover:text-primary transition-colors"
              href="#testimonials"
              onClick={(e) => handleSmoothScroll(e, "testimonials")}
            >
              Testimonials
            </a>
            <hr className="border-outline-variant/60" />
            <Link
              className="text-body-lg text-primary hover:text-secondary transition-colors font-semibold"
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In
            </Link>
            <Link
              className="bg-primary text-on-primary text-center py-3 rounded-sm font-semibold hover:bg-slate-800 transition-colors"
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-24 md:pt-40 md:pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative">
        {/* Abstract background elements */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-container/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4 pointer-events-none"
          style={{ zIndex: -1 }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary-container/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/4 pointer-events-none"
          style={{ zIndex: -1 }}
        ></div>

        <div className="grid md:grid-cols-12 gap-gutter items-center">
          {/* Hero Content */}
          <div className="md:col-span-5 flex flex-col gap-stack-lg z-base">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" aria-hidden="true"></span>
              <span className="text-label-md text-on-surface-variant font-semibold normal-case">New: Automated Payouts Live</span>
            </div>

            <h1 className="text-headline-lg-mobile md:text-display-lg text-primary font-bold leading-tight">
              Property Management on <span className="text-secondary relative whitespace-nowrap">
                Autopilot
                <svg className="absolute w-full h-3 -bottom-1.5 left-0 text-secondary-container" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
                  <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
              </span>
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Streamline your financial operations, automate multi-party splits, and reconcile ledgers with institutional-grade precision. Designed for scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-stack-md pt-stack-sm">
              <Link
                href="/signup"
                className="bg-primary text-on-primary text-label-md px-6 py-3.5 rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] shadow-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
              >
                Start Free Trial
                <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">arrow_forward</span>
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="bg-surface-container-lowest text-primary border border-outline-variant text-label-md px-6 py-3.5 rounded-sm hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
              >
                <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">play_circle</span>
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-stack-sm pt-stack-lg border-t border-outline-variant/60 mt-stack-md">
              <div className="flex -space-x-2">
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-20"
                  alt="Avatar of Property Manager"
                  src="/images/avatar-1.png"
                  loading="lazy"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  alt="Avatar of Real Estate Investor"
                  src="/images/avatar-2.png"
                  loading="lazy"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-0"
                  alt="Avatar of Financial Controller"
                  src="/images/avatar-3.png"
                  loading="lazy"
                />
              </div>
              <p className="text-body-md text-on-surface-variant font-medium">
                Trusted by <span className="font-bold text-primary">500+</span> property managers
              </p>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="md:col-span-7 relative z-base mt-12 md:mt-0 [perspective:1000px]">
            {/* Floating executed popup badge */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-md shadow-card-hover border border-outline-variant animate-[bounce_4s_infinite_ease-in-out] z-sticky-header hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined leading-none" aria-hidden="true">check_circle</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant normal-case font-medium">Split Payout Executed</p>
                <p className="text-title-lg leading-tight text-primary font-bold font-mono">+$12,450.00</p>
              </div>
            </div>

            {/* Dashboard Container with transform hover */}
            <div className="rounded-md overflow-hidden shadow-modal border border-outline-variant bg-white transform rotate-y-[-5deg] rotate-x-[2deg] transition-transform duration-slow ease-emphasized hover:rotate-0">
              {/* Mockup Header Window Controls */}
              <div className="h-10 bg-surface-container-low border-b border-outline-variant flex items-center px-4 gap-2 select-none">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
              </div>
              {/* Dashboard Content Mockup Image */}
              <img
                className="w-full h-auto object-cover border-b border-white select-none pointer-events-none"
                alt="RentFlow Financial Dashboard Mockup Preview"
                src="/images/dashboard-preview.png"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Logo Cloud */}
      <section className="py-12 bg-surface-container-low border-y border-outline-variant/60">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <p className="text-label-md text-on-surface-variant mb-6 tracking-widest uppercase">
            Powering portfolios across the nation
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-[300ms] select-none">
            <div className="text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">apartment</span> Apex Realty
            </div>
            <div className="text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">location_city</span> Nexus Props
            </div>
            <div className="text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">corporate_fare</span> Horizon Mgt
            </div>
            <div className="text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">domain</span> Vesta Living
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto scroll-mt-16" id="features">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-headline-lg text-primary mb-4 font-bold">Everything you need to scale</h2>
          <p className="text-body-lg text-on-surface-variant">
            Replace fragmented spreadsheets with a unified system designed to handle complex financial workflows automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-gutter">

          {/* Card 1: Automated Payouts & Splits (Large 2-column card) */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-md p-8 shadow-sm hover:shadow-card-hover hover:border-slate-300 transition-all duration-base ease-standard flex flex-col gap-6 relative overflow-hidden group">
            <div className="w-12 h-12 bg-secondary-container/40 rounded-sm flex items-center justify-center text-on-secondary-container border border-secondary-container/80">
              <span className="material-symbols-outlined" aria-hidden="true">payments</span>
            </div>

            <div className="z-10">
              <h3 className="text-title-lg text-primary mb-2 font-bold">Automated Payouts & Splits</h3>
              <p className="text-body-md text-on-surface-variant max-w-md">
                Configure complex ownership structures once. The system automatically calculates reserves, management fees, and investor distributions with every rent payment.
              </p>
            </div>

            {/* Split Visualization */}
            <div className="mt-auto pt-6 border-t border-outline-variant/60 flex flex-col gap-3 select-none">
              <div className="flex justify-between items-center text-label-md text-on-surface-variant font-semibold">
                <span>Distribution Split</span>
                <span className="text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                  Executing...
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden flex">
                <div className="h-full bg-tertiary w-[15%] transition-all duration-[1000ms]"></div>
                <div className="h-full bg-slate-400 w-[5%] border-l border-white"></div>
                <div className="h-full bg-secondary w-[80%] border-l border-white group-hover:bg-emerald-400 transition-colors"></div>
              </div>
              <div className="flex justify-between text-code-md font-mono text-on-surface-variant/80 text-[11px]">
                <span>Reserve (15%)</span>
                <span>Fee (5%)</span>
                <span>Owner Payout (80%)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Virtual Accounts */}
          <div className="bg-white border border-outline-variant rounded-md p-8 shadow-sm hover:shadow-card-hover hover:border-slate-300 transition-all duration-base ease-standard flex flex-col gap-6">
            <div className="w-12 h-12 bg-primary-container/10 rounded-sm flex items-center justify-center text-primary border border-outline-variant/60">
              <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-title-lg text-primary mb-2 font-bold">Virtual Accounts</h3>
              <p className="text-body-md text-on-surface-variant">
                Generate unique virtual account numbers for every tenant. Instantly reconcile payments without manual matching.
              </p>
            </div>

            <div className="mt-auto bg-surface-container-low p-4 rounded-sm border border-outline-variant/40 font-mono text-code-md text-primary flex justify-between items-center select-all">
              <span>ACC-4892-XXXX</span>
              <span className="text-secondary leading-none flex items-center" title="Verified Account">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check</span>
              </span>
            </div>
          </div>

          {/* Card 3: Exception Handling */}
          <div className="bg-white border border-outline-variant rounded-md p-8 shadow-sm hover:shadow-card-hover hover:border-slate-300 transition-all duration-base ease-standard flex flex-col gap-6">
            <div className="w-12 h-12 bg-error-container/40 rounded-sm flex items-center justify-center text-on-error-container border border-error-container/80">
              <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            </div>
            <div>
              <h3 className="text-title-lg text-primary mb-2 font-bold">Exception Handling</h3>
              <p className="text-body-md text-on-surface-variant">
                Automatically flag partial payments, NSF returns, and late fees. Keep your ledgers spotless with guided resolution workflows.
              </p>
            </div>
            {/* Visual warning state */}
            <div className="mt-auto flex items-center gap-3 bg-error-container/20 p-3 rounded-sm border border-error-container/30 text-on-error-container">
              <span className="material-symbols-outlined text-error text-[20px]" aria-hidden="true">error_outline</span>
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">1 Pending NSF Exception</span>
            </div>
          </div>

          {/* Card 4: Utility Ledgers & RUBS (Large 2-column card) */}
          <div className="md:col-span-2 bg-white border border-outline-variant rounded-md p-8 shadow-sm hover:shadow-card-hover hover:border-slate-300 transition-all duration-base ease-standard flex flex-col sm:flex-row gap-8 items-center">
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-12 h-12 bg-surface-container-high rounded-sm flex items-center justify-center text-primary border border-outline-variant/60">
                <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
              </div>
              <h3 className="text-title-lg text-primary font-bold">Utility Ledgers & RUBS</h3>
              <p className="text-body-md text-on-surface-variant">
                Bulk upload utility bills and instantly calculate RUBS (Ratio Utility Billing System) allocations per unit based on square footage or occupancy.
              </p>
              <a
                onClick={() => setDemoOpen(true)}
                className="text-primary font-semibold text-label-md hover:text-secondary transition-colors inline-flex items-center gap-1 mt-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 rounded"
              >
                See how it works
                <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">arrow_forward</span>
              </a>
            </div>

            {/* Mini RUBS Table */}
            <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant rounded-sm p-4 flex flex-col gap-2.5 shadow-sm font-sans select-none">
              <div className="flex justify-between text-label-md text-on-surface-variant font-bold border-b border-outline-variant/60 pb-2 mb-1">
                <span>Unit</span>
                <span>Allocation</span>
                <span>Amt</span>
              </div>
              <div className="flex justify-between text-body-md text-primary items-center font-mono">
                <span>101</span>
                <div className="w-1/3 bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[40%] rounded-full"></div>
                </div>
                <span className="font-semibold">$45.20</span>
              </div>
              <div className="flex justify-between text-body-md text-primary items-center font-mono">
                <span>102</span>
                <div className="w-1/3 bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[60%] rounded-full"></div>
                </div>
                <span className="font-semibold">$67.80</span>
              </div>
              <div className="flex justify-between text-body-md text-primary items-center font-mono">
                <span>103</span>
                <div className="w-1/3 bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[80%] rounded-full"></div>
                </div>
                <span className="font-semibold">$90.40</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-primary-container text-white relative overflow-hidden" id="testimonials">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop relative z-base text-center">
          <span className="material-symbols-outlined text-[56px] text-secondary opacity-40 mb-6 leading-none select-none" aria-hidden="true">
            format_quote
          </span>
          <h2 className="text-headline-lg md:text-[36px] md:leading-[44px] mb-10 font-bold max-w-3xl mx-auto italic tracking-tight text-white">
            "RentFlow reduced our month-end reconciliation time from five days to less than two hours. The automated split payouts alone saved us the cost of a full-time bookkeeper."
          </h2>
          <div className="flex items-center justify-center gap-4">
            <img
              className="w-14 h-14 rounded-full border-2 border-emerald-500/50 object-cover"
              alt="Sarah Jenkins Headshot Portrait"
              src="/images/testimonial-sarah.png"
              loading="lazy"
            />
            <div className="text-left">
              <p className="text-title-lg font-bold text-white leading-tight">Sarah Jenkins</p>
              <p className="text-body-md text-on-primary-container">Director of Operations, Horizon Management</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
        <div className="bg-surface-container-low border border-outline-variant rounded-md p-12 md:p-20 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <h2 className="text-headline-lg text-primary mb-4 max-w-2xl mx-auto font-bold">
            Ready to upgrade your property management stack?
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
            Join hundreds of operators using RentFlow to manage billions in real estate assets with confidence.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="bg-primary text-on-primary text-label-md px-8 py-4 rounded-sm hover:bg-slate-800 transition-all font-semibold hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] shadow-md outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="bg-white text-primary border border-outline-variant text-label-md px-8 py-4 rounded-sm hover:bg-surface-container-low transition-colors font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-outline-variant pt-16 pb-8 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-stack-sm mb-4">
              <span className="material-symbols-outlined text-secondary text-[24px] leading-none" aria-hidden="true">
                real_estate_agent
              </span>
              <span className="text-title-lg font-bold text-primary">RentFlow</span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-sm mb-6 leading-relaxed">
              Institutional-grade property management and financial operations software.
            </p>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer hover:bg-surface-container-highest"
                aria-label="Website Link"
              >
                <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">language</span>
              </div>
              <div
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer hover:bg-surface-container-highest"
                aria-label="Share Link"
              >
                <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">share</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-label-md text-primary mb-4 font-bold">Product</h4>
            <ul className="flex flex-col gap-3 text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#features">Payouts & Splits</Link></li>
              <li><Link className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#features">Utility Ledgers</Link></li>
              <li><Link className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#features">Virtual Accounts</Link></li>
              <li><Link className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#features">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md text-primary mb-4 font-bold">Resources</h4>
            <ul className="flex flex-col gap-3 text-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Help Center</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">API Documentation</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Case Studies</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-md text-primary mb-4 font-bold">Company</h4>
            <ul className="flex flex-col gap-3 text-body-md text-on-surface-variant">
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Legal</a></li>
              <li><a className="hover:text-primary transition-colors outline-none focus-visible:underline" href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-container-max mx-auto border-t border-outline-variant/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} RentFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-on-surface-variant">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal Popup */}
      {demoOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-[12px] flex items-center justify-center p-4 z-modal animate-[fadeIn_200ms_ease-out]">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-md shadow-modal border border-outline-variant max-w-3xl w-full overflow-hidden flex flex-col animate-[scaleIn_250ms_cubic-bezier(0.2,0,0,1)]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/60 flex justify-between items-center bg-surface-container-low">
              <h3 className="text-title-lg text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" aria-hidden="true">play_circle</span>
                RentFlow Platform Walkthrough
              </h3>
              <button
                onClick={() => setDemoOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container-high transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                aria-label="Close walkthrough modal"
              >
                <span className="material-symbols-outlined leading-none" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Mock Video Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center p-8">
              {/* Background styling elements */}
              <div className="absolute inset-0 bg-slate-900/60 z-0 flex flex-col justify-center items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center text-white cursor-pointer hover:bg-secondary transition-all hover:scale-115 mb-4 shadow-md select-none group">
                  <span className="material-symbols-outlined text-[36px] ml-1 select-none leading-none" aria-hidden="true">play_arrow</span>
                </div>
                <h4 className="text-white text-title-lg font-bold">Watch Platform Demo</h4>
                <p className="text-slate-300 text-sm max-w-md mt-2">
                  See how RentFlow reels in tenant ledger balances and automates multi-owner disbursement distributions.
                </p>
                <span className="text-xs text-secondary bg-secondary-container/20 px-3 py-1 rounded-full border border-secondary-container/30 mt-4 select-none font-semibold uppercase tracking-wider font-mono">
                  Duration: 2 mins
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/60 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-body-md text-on-surface-variant">
                Want to try it out yourself? Set up a free sandbox tenant account.
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setDemoOpen(false)}
                  className="bg-transparent text-primary hover:bg-surface-container-high px-4 py-2.5 rounded-sm font-semibold transition-colors border border-transparent text-sm w-full sm:w-auto outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                >
                  Close
                </button>
                <Link
                  href="/signup"
                  onClick={() => setDemoOpen(false)}
                  className="bg-primary text-on-primary text-center hover:bg-slate-800 px-5 py-2.5 rounded-sm font-semibold hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all text-sm w-full sm:w-auto outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS injected style for simple slideDown animations */}
      <style jsx global>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

    </div>
  );
}
