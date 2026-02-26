import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 text-center">
      {/* Background decorations */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-royal/10 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute bottom-1/4 right-1/4">
        <div className="h-[300px] w-[300px] rounded-full bg-gold/5 blur-[100px]" />
      </div>

      {/* Logo */}
      <Image
        src="/images/logo.png"
        alt="American Royalty"
        width={180}
        height={72}
        className="mb-8 h-16 w-auto"
      />

      {/* 404 Text */}
      <h1 className="gold-gradient-text text-[8rem] font-bold leading-none sm:text-[10rem]">
        404
      </h1>

      {/* Heading */}
      <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
        Page Not Found
      </h2>

      {/* Message */}
      <p className="mx-auto mt-4 max-w-md text-lg text-white/60">
        The page you are looking for does not exist or has been moved.
        Let us get you back on track.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/" className="btn-gold text-base">
          Back to Home
        </Link>
        <Link href="/fleet" className="btn-outline text-base">
          View Our Fleet
        </Link>
      </div>
    </div>
  )
}
