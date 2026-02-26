'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 text-center">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[400px] w-[400px] rounded-full bg-red-900/10 blur-[100px]" />
      </div>

      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <svg
          className="h-10 w-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        Something Went Wrong
      </h1>

      {/* Error message */}
      <p className="mx-auto mt-4 max-w-md text-lg text-white/60">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <button onClick={reset} className="btn-gold text-base">
          Try Again
        </button>
        <Link href="/" className="btn-outline text-base">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
