import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, BarChart3, Sparkles } from "lucide-react"; 
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/**
   * SmartAttend brand mark.
   * A verification checkmark fused with three connected AI "nodes" inside a
   * rounded shield — reads as trust + verification + intelligence without
   * leaning on a literal graduation cap or book.
 */
function BrandLogo({ size = 36 }: { size?: number }) {
  return (
    <div className="group relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/40 via-indigo-500/40 to-cyan-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="relative transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
      >
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="34" height="34" rx="11" stroke="url(#brandGrad)" strokeWidth="2" fill="none" />
        {/* AI nodes */}
        <circle cx="13" cy="12" r="1.8" fill="url(#brandGrad)" />
        <circle cx="27" cy="12" r="1.8" fill="url(#brandGrad)" />
        <circle cx="20" cy="8" r="1.8" fill="url(#brandGrad)" />
        <path d="M13 12 L20 8 L27 12" stroke="url(#brandGrad)" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Verification check */}
        <path
          d="M12 21 L18 27 L28 15"
          stroke="url(#brandGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="origin-center"
          style={{
            strokeDasharray: 24,
            strokeDashoffset: 0,
          }}
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="url(#brandGrad)"
          strokeWidth="0.5"
          fill="none"
          opacity="0.35"
          strokeDasharray="2 4"
          className="origin-center animate-[spin_18s_linear_infinite]"
        />
      </svg>
    </div>
  );
}

/**
 * Left-panel illustration: a student under a tree with a laptop. Entirely
 * SVG/CSS/Framer Motion — no raster assets. Eyes, head tilt and laptop tilt
 * respond to pointer position; the password field toggles a "cover eyes"
 * pose via `handsUp`; `success` drives the smile + laptop glow + confetti
 * burst.
 */
function HeroIllustration({
  handsUp,
  success,
}: {
  handsUp: boolean;
  success: boolean;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const pupilX = useTransform(mx, [-1, 1], [-2.5, 2.5]);
  const pupilY = useTransform(my, [-1, 1], [-1.5, 1.5]);
  const headRotate = useTransform(mx, [-1, 1], [-3, 3]);
  const laptopRotate = useTransform(mx, [-1, 1], [2, -2]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  return (
    <div className="relative h-full w-full overflow-hidden" onMouseMove={onMouseMove}>
      <svg viewBox="0 0 480 640" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1147" />
            <stop offset="100%" stopColor="#0b0c14" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a2e35" />
            <stop offset="100%" stopColor="#182042" />
          </linearGradient>
          <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        <rect width="480" height="640" fill="url(#skyGrad)" />

        {/* Stars */}
        {Array.from({ length: 18 }).map((_, i) => {
          const sx = (i * 71 + 20) % 460 + 10;
          const sy = (i * 53 + 15) % 220 + 10;
          return (
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={i % 3 === 0 ? 1.6 : 1}
              fill="#ffffff"
              opacity={0.5}
              style={{
                animation: `twinkle ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          );
        })}

        {/* Clouds */}
        <g opacity="0.12" style={{ animation: "driftSlow 50s linear infinite" }}>
          <ellipse cx="90" cy="90" rx="60" ry="18" fill="#ffffff" />
          <ellipse cx="140" cy="80" rx="40" ry="14" fill="#ffffff" />
        </g>
        <g opacity="0.08" style={{ animation: "driftSlow 70s linear infinite reverse" }}>
          <ellipse cx="360" cy="140" rx="70" ry="20" fill="#ffffff" />
        </g>

        {/* Ground */}
        <path d="M0 560 Q240 500 480 560 L480 640 L0 640 Z" fill="url(#groundGrad)" />

        {/* Tree */}
        <g>
          <path d="M235 560 L245 560 L248 400 L232 400 Z" fill="#3b2b52" />
          <g
            style={{
              transformOrigin: "240px 380px",
              animation: "sway 6s ease-in-out infinite",
            }}
          >
            {[
              [240, 300, 70],
              [190, 340, 46],
              [290, 340, 46],
              [200, 280, 40],
              [280, 280, 40],
              [240, 250, 44],
            ].map(([cx, cy, r], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="url(#canopyGrad)"
                opacity={0.85}
                style={{
                  animation: `pulseSoft ${4 + i}s ease-in-out ${i * 0.4}s infinite`,
                }}
              />
            ))}
          </g>
        </g>

        {/* Floating attendance widgets */}
        <g style={{ animation: "float 5s ease-in-out infinite" }}>
          <rect x="330" y="200" width="92" height="34" rx="10" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.15" />
          <circle cx="348" cy="217" r="6" fill="#34d399" />
          <text x="362" y="221" fontSize="11" fill="#e5e7eb" fontFamily="Inter, sans-serif">98% present</text>
        </g>
        <g style={{ animation: "float 6s ease-in-out 0.8s infinite" }}>
          <rect x="60" y="240" width="78" height="34" rx="10" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.15" />
          <path d="M74 256 L82 264 L96 248" stroke="#22d3ee" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="104" y="260" fontSize="11" fill="#e5e7eb" fontFamily="Inter, sans-serif">Verified</text>
        </g>

        {/* Student */}
        <g style={{ transformOrigin: "240px 500px", animation: "breathe 4.5s ease-in-out infinite" }}>
          {/* legs, crossed */}
          <path d="M170 560 Q240 590 310 560 L300 575 Q240 600 180 575 Z" fill="#4338ca" />

          {/* torso */}
          <path d="M205 470 Q240 450 275 470 L280 545 Q240 560 200 545 Z" fill="#4f46e5" />

          {/* head + face group, subtle tilt toward pointer */}
          <motion.g style={{ rotate: headRotate, transformOrigin: "240px 430px" }}>
            <circle cx="240" cy="430" r="34" fill="#fbcfa0" />
            <path d="M208 420 Q240 392 272 420 Q272 400 240 398 Q208 400 208 420 Z" fill="#2e2140" />

            {/* eyes (open state) */}
            <g opacity={handsUp ? 0 : 1} style={{ transition: "opacity 0.25s ease" }}>
              <g style={{ animation: "blink 5s ease-in-out infinite" }}>
                <circle cx="228" cy="430" r="4.5" fill="#1f1530" />
                <circle cx="252" cy="430" r="4.5" fill="#1f1530" />
              </g>
              <motion.circle cx="228" cy="430" r="1.8" fill="#ffffff" style={{ translateX: pupilX, translateY: pupilY }} />
              <motion.circle cx="252" cy="430" r="1.8" fill="#ffffff" style={{ translateX: pupilX, translateY: pupilY }} />
            </g>

            {/* mouth: neutral or smiling on success */}
            <path
              d={success ? "M226 444 Q240 456 254 444" : "M228 446 Q240 450 252 446"}
              stroke="#7c2d12"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              style={{ transition: "d 0.4s ease" }}
            />
          </motion.g>

          {/* arm/hand that covers eyes while the password field is focused */}
          <motion.g
            animate={{ y: handsUp ? -78 : 0, rotate: handsUp ? -18 : 0 }}
            transition={{ type: "spring", stiffness: 140, damping: 15 }}
            style={{ transformOrigin: "215px 480px" }}
          >
            <path d="M215 480 Q195 460 214 428 Q222 420 232 426 Q216 448 226 470 Z" fill="#fbcfa0" />
          </motion.g>

          {/* laptop, gentle tilt toward pointer, glows on success */}
          <motion.g style={{ rotate: laptopRotate, transformOrigin: "240px 545px" }}>
            <rect x="205" y="530" width="70" height="46" rx="4" fill="#1e1b3a" stroke="#3730a3" />
            <rect
              x="209"
              y="534"
              width="62"
              height="34"
              rx="2"
              fill="url(#screenGrad)"
              opacity={success ? 1 : 0.55}
              style={{
                filter: success ? "drop-shadow(0 0 14px rgba(34,211,238,0.85))" : "none",
                transition: "opacity 0.5s ease, filter 0.5s ease",
              }}
            />
            <rect x="198" y="576" width="84" height="6" rx="2" fill="#312e81" />
          </motion.g>
        </g>

        {/* success burst */}
        <AnimatePresence>
          {success && (
            <motion.g
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformOrigin: "240px 545px" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx="240"
                  cy="545"
                  r="10"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  fill="none"
                  initial={{ r: 10, opacity: 0.8 }}
                  animate={{ r: 60 + i * 20, opacity: 0 }}
                  transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.4 }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      <style>{`
        @keyframes sway { 0%, 100% { transform: rotate(-1.2deg); } 50% { transform: rotate(1.2deg); } }
        @keyframes pulseSoft { 0%, 100% { opacity: 0.75; } 50% { opacity: 0.95; } }
        @keyframes breathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.012); } }
        @keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.08); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes driftSlow { 0% { transform: translateX(-30px); } 100% { transform: translateX(30px); } }
        @keyframes twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.9; } }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // UI-only state for the illustration; does not affect auth flow.
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setLoginSuccess(true);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0c14] font-sans">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-purple-600/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-indigo-600/25 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
        {/* noise texture */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Brand mark */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3 sm:top-8 sm:left-8">
        <BrandLogo />
        <div>
          <span className="font-display block text-base font-semibold tracking-tight text-white">SmartAttend</span>
          <span className="block text-[11px] tracking-wide text-white/40">Intelligent Attendance Platform</span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-stretch">
        {/* Left: illustration (45%) */}
        <div className="relative hidden w-[45%] items-center justify-center lg:flex">
          <HeroIllustration handsUp={passwordFocused} success={loginSuccess} />
        </div>

        {/* Right: login card (55%) */}
        <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[55%]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-md"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500/40 via-indigo-500/30 to-cyan-400/40 opacity-0 blur transition-opacity duration-700 hover:opacity-60" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-shadow duration-500 hover:shadow-[0_8px_50px_rgba(99,102,241,0.25)] sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Welcome back</h1>
                <p className="mt-2 text-sm text-white/50">Sign in to your SmartAttend account to continue.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold text-white/60">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                      size={18}
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/30"
                      placeholder="you@smartattend.dev"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-semibold text-white/60">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                      size={18}
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      aria-required="true"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/10 focus:ring-2 focus:ring-indigo-400/30"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 py-3 text-sm font-semibold text-[#0b0c14] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    "Signing in…"
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8 border-t border-white/10 pt-5 text-xs text-white/40">
                <p className="mb-1 font-semibold text-white/60">Demo accounts (password: password123)</p>
                <p>admin@smartattend.dev · faculty@smartattend.dev · student1@smartattend.dev</p>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-white/25">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> AI-verified
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={12} /> Real-time insights
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
