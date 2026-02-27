'use client'

export function DiscoLights() {
  return (
    <div className="relative h-24 sm:h-32 overflow-hidden bg-black" aria-hidden="true">
      {/* Laser beams from center top */}
      <div className="absolute inset-0">
        {/* Purple lasers */}
        <div className="laser laser-1" />
        <div className="laser laser-2" />
        <div className="laser laser-3" />
        <div className="laser laser-4" />
        {/* Gold lasers */}
        <div className="laser laser-5" />
        <div className="laser laser-6" />
        <div className="laser laser-7" />
        <div className="laser laser-8" />
      </div>

      {/* Disco ball glow at center top */}
      <div className="absolute left-1/2 -top-8 -translate-x-1/2">
        <div className="disco-ball" />
      </div>

      {/* Scattered disco dots */}
      <div className="absolute inset-0">
        <div className="disco-dot disco-dot-1" />
        <div className="disco-dot disco-dot-2" />
        <div className="disco-dot disco-dot-3" />
        <div className="disco-dot disco-dot-4" />
        <div className="disco-dot disco-dot-5" />
        <div className="disco-dot disco-dot-6" />
        <div className="disco-dot disco-dot-7" />
        <div className="disco-dot disco-dot-8" />
        <div className="disco-dot disco-dot-9" />
        <div className="disco-dot disco-dot-10" />
        <div className="disco-dot disco-dot-11" />
        <div className="disco-dot disco-dot-12" />
      </div>

      {/* Ambient glow overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-full w-1/3 bg-royal/[0.08] blur-[60px] animate-disco-pulse" />
        <div className="absolute right-1/4 top-0 h-full w-1/3 bg-gold/[0.06] blur-[60px] animate-disco-pulse-delayed" />
      </div>

      {/* Fade edges to black */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black to-transparent" />
    </div>
  )
}

export default DiscoLights
