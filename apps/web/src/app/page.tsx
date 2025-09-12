import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden" aria-label="Hero" role="banner">
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-gradient-to-tr from-sky-400/10 to-fuchsia-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-200">
            See a problem in your city? Report it in seconds.
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-zinc-600 dark:text-zinc-300">
            Capture. Submit. Track. Help your city improve.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/report"
              className="inline-flex justify-center items-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
            >
              Report Now
            </Link>
            <Link
              href="/track"
              className="inline-flex justify-center items-center rounded-lg border border-indigo-300/60 px-8 py-4 text-base font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-500/40 dark:hover:bg-indigo-500/10 transition"
            >
              Track Report
            </Link>
          </div>
          <div className="mt-14 w-full max-w-5xl aspect-[16/7] rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center text-zinc-400 text-sm sm:text-base">
            <span className="px-4 text-zinc-500 dark:text-zinc-400">City illustration / hero graphic placeholder</span>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="relative py-20 bg-white dark:bg-zinc-950" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 text-center">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md text-white">
                {/* Camera icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75v-6a3 3 0 0 1 3-3h2.102a2 2 0 0 0 1.789-1.106l.724-1.447A2 2 0 0 1 11.42 3h1.16a2 2 0 0 1 1.755 1.004l.861 1.492A2 2 0 0 0 16.78 6.75h1.97a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3Z" />
                  <circle cx="12" cy="12" r="3.25" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Take a photo 📷</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">Snap the issue: pothole, trash, graffiti, lighting & more.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md text-white">
                {/* Location pin icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-1.657-1.493-6.75-6.033-6.75-10.5A6.75 6.75 0 0 1 12 3.75a6.75 6.75 0 0 1 6.75 6.75C18.75 14.967 13.657 19.507 12 21Z" />
                  <circle cx="12" cy="10.5" r="2.5" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Submit with location 📍</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">Attach GPS or map pin so crews know exactly where.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md text-white">
                {/* Check badge icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-100">Track until resolved ✅</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">Get status updates & closure confirmation.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Mini Map Preview */}
      <section className="relative py-20 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200/60 dark:border-zinc-800" aria-labelledby="mini-map-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 w-full">
              <h2 id="mini-map-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 mb-4">
                Live Issues Snapshot
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-prose mb-6">
                Quickly glance at issues reported around the city. Zoom into specific neighborhoods on the full map to explore details or submit your own.
              </p>
              <Link href="/map" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 font-medium shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition">
                See All Reports
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="flex-1 w-full">
              <div className="relative aspect-[4/3] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100 dark:from-sky-900/20 dark:via-indigo-900/10 dark:to-violet-900/10 overflow-hidden" aria-label="Static example map">
                <div className="absolute inset-0 opacity-40 grid grid-cols-6 grid-rows-6" aria-hidden>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border border-white/40 dark:border-white/5" />
                  ))}
                </div>
                <div className="absolute inset-0" aria-hidden>
                  <span className="absolute left-[18%] top-[28%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-semibold shadow-lg shadow-orange-500/40">P</span>
                  <span className="absolute left-[62%] top-[52%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-600/40">T</span>
                  <span className="absolute left-[40%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-600 text-white text-xs font-semibold shadow-lg shadow-fuchsia-600/40">L</span>
                  <span className="absolute left-[78%] top-[24%] -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/40">R</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur px-4 py-2 text-[11px] flex items-center justify-between gap-4 text-zinc-600 dark:text-zinc-400">
                  <span>Static demo map (placeholder)</span>
                  <span className="hidden sm:inline">Markers: Pothole, Trash, Lighting, Road</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why Use This */}
      <section className="relative py-24 bg-white dark:bg-zinc-950" aria-labelledby="why-use-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="why-use-heading" className="text-2xl sm:text-3xl font-semibold tracking-tight text-center text-zinc-800 dark:text-zinc-100">
            Why Use This Platform
          </h2>
          <p className="mt-4 text-center text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Designed for both residents and city operations. Transparency, speed, and coordination in one place.
          </p>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-8 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 shadow-sm">
              <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4">For Citizens</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="mt-0.5 text-indigo-600 dark:text-indigo-400" aria-hidden>•</span> <span>Easy, intuitive report flow with photo & location.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-indigo-600 dark:text-indigo-400" aria-hidden>•</span> <span>Transparent status updates & notifications.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-indigo-600 dark:text-indigo-400" aria-hidden>•</span> <span>Build community impact with visible progress.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-indigo-600 dark:text-indigo-400" aria-hidden>•</span> <span>Mobile-friendly & fast – report in seconds.</span></li>
              </ul>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800 p-8 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 shadow-sm">
              <h3 className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-4">For City Staff</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-3"><span className="mt-0.5 text-violet-600 dark:text-violet-400" aria-hidden>•</span> <span>Centralized dashboard & workload visibility.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-violet-600 dark:text-violet-400" aria-hidden>•</span> <span>Auto-routing by category & location.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-violet-600 dark:text-violet-400" aria-hidden>•</span> <span>Performance analytics & SLA tracking.</span></li>
                <li className="flex gap-3"><span className="mt-0.5 text-violet-600 dark:text-violet-400" aria-hidden>•</span> <span>Faster resolution & citizen satisfaction.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
        {/* Call To Action Banner */}
        <section className="relative py-28 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white" aria-labelledby="final-cta-heading">
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" aria-hidden>
            <svg aria-hidden className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
            <h2 id="final-cta-heading" className="text-3xl sm:text-4xl font-bold tracking-tight max-w-3xl">
              Ready to help improve your city?
            </h2>
              <p className="mt-5 text-lg text-white/90 max-w-2xl">
              Report issues in seconds and see real progress as they get resolved.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-5">
              <Link href="/report" className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-700 font-semibold px-10 py-4 text-base shadow-lg shadow-black/10 hover:shadow-xl hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition">
                Start Reporting Now
              </Link>
              <div className="flex items-center gap-3" aria-label="App store badges (coming soon)">
                <div className="h-12 w-36 rounded-lg border border-white/30 flex items-center justify-center text-xs font-medium tracking-wide uppercase bg-white/10 backdrop-blur-sm">
                  App Store
                </div>
                <div className="h-12 w-36 rounded-lg border border-white/30 flex items-center justify-center text-xs font-medium tracking-wide uppercase bg-white/10 backdrop-blur-sm">
                  Play Store
                </div>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
