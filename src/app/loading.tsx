import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      {/* Logo */}
      <Image
        src="/images/logo.png"
        alt="American Royalty"
        width={160}
        height={64}
        className="mb-8 h-14 w-auto"
        priority
      />

      {/* Spinner */}
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />

      {/* Loading text */}
      <p className="mt-4 text-sm font-medium tracking-wider text-gold/60">
        Loading...
      </p>
    </div>
  )
}
