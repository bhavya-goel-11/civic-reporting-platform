"use client";
import Link from "next/link";
import React from "react";

export default function ReportPage() {
  const [dragOver, setDragOver] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED = ["image/jpeg", "image/png"]; // JPG, PNG

  function validateFile(f: File) {
    if (!ACCEPTED.includes(f.type)) {
      return "Please upload a JPG or PNG image.";
    }
    if (f.size > MAX_SIZE) {
      return "File is too large. Max size is 5MB.";
    }
    return null;
  }

  function handleFiles(fs: FileList | null) {
    if (!fs || fs.length === 0) return;
    const f = fs[0];
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
    } else {
      setError(null);
      setFile(f);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simple client-side validation
    if (!file) {
      setError("Please upload a photo (JPG or PNG, max 5MB).");
      return;
    }
    if (!description.trim()) {
      setError("Please add a short description of the issue.");
      return;
    }

    // Stub submit: In a real app, send to API and redirect to tracking/thank-you
    alert("Report submitted! Thank you for helping improve your city.");
    setFile(null);
    setDescription("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">📝 Report an Issue</h1>
          <p className="mt-3 text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
            Help us fix problems in your area. Upload a photo and add a short description.
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-8" noValidate>
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-stone-800 dark:text-stone-200 mb-2">Upload a photo <span className="text-rose-600">*</span></label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={
                "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition " +
                (dragOver
                  ? "border-amber-500 bg-amber-50/60 dark:border-amber-400 dark:bg-stone-800/30"
                  : "border-amber-300 bg-white/70 dark:border-stone-700 dark:bg-stone-900/40")
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 text-amber-700 dark:text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V3.75m0 0L8.25 7.5M12 3.75l3.75 3.75M6.75 12A4.5 4.5 0 0 0 3 16.5v0A4.5 4.5 0 0 0 7.5 21h9a4.5 4.5 0 0 0 4.5-4.5v0A4.5 4.5 0 0 0 16.5 12" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  Drag & drop an image, or
                  <button
                    type="button"
                    className="ml-1 underline underline-offset-4 text-amber-800 hover:text-amber-700 dark:text-amber-300"
                    onClick={() => inputRef.current?.click()}
                  >
                    choose a file
                  </button>
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Accepted formats: JPG, PNG (max 5MB)</p>
                {file && (
                  <p className="mt-2 text-xs text-stone-700 dark:text-stone-300">Selected: {file.name}</p>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-800 dark:text-stone-200 mb-2">
              Describe the issue <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Broken streetlight near Main Street crossing, not working since last night."
              className="w-full rounded-xl border border-amber-300 bg-white/70 dark:border-stone-700 dark:bg-stone-900/40 px-4 py-3 text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
              required
            />
          </div>

          {/* Location helper (MVP) */}
          <div className="text-xs text-stone-600 dark:text-stone-400">
            We’ll automatically detect your location, or you can adjust later.
          </div>

          {/* Error */}
          <div aria-live="polite" className="min-h-[1.25rem]">
            {error && (
              <p className="text-sm text-rose-600">{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-amber-800 text-white font-semibold px-8 py-3 text-sm shadow-sm hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 transition w-full sm:w-auto"
            >
              Submit Report
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
