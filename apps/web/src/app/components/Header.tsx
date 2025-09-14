"use client";
import React, { useState } from 'react';
import Link from 'next/link';

// Basic responsive site header for CivicConnect
// Features:
// - Brand name on left
// - Navigation actions on right (Report Issue primary CTA)
// - Mobile menu (hamburger) with slide-down panel
// - Accessible buttons & aria attributes
// - Tailwind utility classes (Tailwind v4 via @tailwindcss/postcss)

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b border-amber-200/70 bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100 dark:border-stone-800 dark:from-stone-950 dark:via-stone-900 dark:to-stone-900 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-amber-500 via-orange-500 to-stone-500 shadow ring-1 ring-black/10 dark:ring-white/10 flex items-center justify-center text-white font-semibold text-sm group-hover:scale-105 transition">
                CC
              </div>
              <span className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                CivicConnect
              </span>
            </Link>
          </div>

            {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 ml-auto">
            <Link
              href="/report"
              className="inline-flex items-center gap-1 rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 transition"
            >
              Report Issue
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            >
              Track Issue
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            >
              View All Reports
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            >
              User Login
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto flex items-center">
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
              className="inline-flex items-center justify-center rounded-md p-2 text-stone-600 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                className={`h-6 w-6 ${open ? 'hidden' : 'block'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg
                className={`h-6 w-6 ${open ? 'block' : 'hidden'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Panel */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="space-y-1 px-4 pb-6 pt-2 border-t border-amber-200/70 dark:border-stone-800 bg-white/90 backdrop-blur dark:bg-stone-950/80">
          <Link
            href="/report"
            className="block rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 transition"
            onClick={() => setOpen(false)}
          >
            Report Issue
          </Link>
          <Link
            href="/track"
            className="block rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            onClick={() => setOpen(false)}
          >
            Track Issue
          </Link>
          <Link
            href="/map"
            className="block rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            onClick={() => setOpen(false)}
          >
            View All Reports
          </Link>
          <Link
            href="/admin"
            className="block rounded-md px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-amber-50 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-800 transition"
            onClick={() => setOpen(false)}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}