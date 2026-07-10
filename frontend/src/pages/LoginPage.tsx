import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

/**
 * SmartAttend brand mark — custom SVG, not a Lucide icon.
 * Kept as the checkmark/AI-node mark (rather than a graduation cap) per the
 * brand direction already established for this project.
 */
function BrandLogo({ size = 34 }: { size?: number }) {
  return (
    <div className="group relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C3AED]/40 via-[#8B5CF6]/40 to-[#06B6D4]/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <svg viewBox="0 0 40 40" width={size} height={size} className="relative transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="34" height="34" rx="11" stroke="url(#brandGrad)" strokeWidth="2" fill="none" />
        <circle cx="13" cy="12" r="1.8" fill="url(#brandGrad)" />
        <circle cx="27" cy="12" r="1.8" fill="url(#brandGrad)" />
        <circle cx="20" cy="8" r="1.8" fill="url(#brandGrad)" />
        <path d="M13 12 L20 8 L27 12" stroke="url(#brandGrad)" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M12 21 L18 27 L28 15" stroke="url(#brandGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="20" cy="20" r="16" stroke="url(#brandGrad)" strokeWidth="0.5" fill="none" opacity="0.35" strokeDasharray="2 4" className="origin-center animate-[spin_18s_linear_infinite]" />
      </svg>
    </div>
  );
}

/**
 * Static hero illustration (frontend/public/login-hero.webp). Replaces the
 * previous hand-built SVG scene entirely — no student/tree/props/animation
 * primitives are drawn in code anymore. The only motion left here is a
 * fade-in on mount, a gentle hover zoom, and a soft glow pulse on login
 * success, all applied on top of the flat image.
 */
function HeroIllustration({ hovering, success }: { hovering: boolean; success: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.img
        src="/login-hero.webp"
        alt="SmartAttend Hero"
        className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: hovering ? 1.015 : 1 }}
        transition={{ opacity: { duration: 1 }, scale: { duration: 0.8, ease: "easeOut" } }}
        draggable={false}
      />

      {/* Dark purple tint so the image sits in the same palette as the page background */}
      <div className="pointer-events-none absolute inset-0 bg-[#150c33]/35 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0c14]/40 via-transparent to-[#0b0c14]/50" />

      {/* Edge fades so there's no hard vertical seam between the image and the card side */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent to-[#0b0c14]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0b0c14] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b0c14] to-transparent" />

      {/* Soft success glow, layered above the image */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 45% 55%, rgba(139,92,246,0.35), transparent 60%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: success ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      />
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

  // UI-only state driving the hero image and cosmetic form affordances.
  // None of it is read by handleSubmit or sent anywhere.
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [illustrationHovered, setIllustrationHovered] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#7C3AED]/30 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#06B6D4]/20 blur-3xl animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#8B5CF6]/25 blur-3xl animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="absolute top-6 left-6 z-10 flex items-center gap-3 sm:top-8 sm:left-8">
        <BrandLogo />
        <div>
          <span className="font-display block text-base font-semibold tracking-tight text-white">SmartAttend</span>
          <span className="block text-[11px] tracking-wide text-white/40">Intelligent Attendance Platform</span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-stretch">
        {/* Desktop: 45% image. Tablet: image still shows, scaled via object-cover. Mobile: hidden entirely. */}
        <div
          className="relative hidden md:flex md:w-[45%]"
          onMouseEnter={() => setIllustrationHovered(true)}
          onMouseLeave={() => setIllustrationHovered(false)}
        >
          <HeroIllustration hovering={illustrationHovered} success={loginSuccess} />
        </div>

        <div className="flex w-full items-center justify-center px-4 py-10 md:w-[55%]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{ opacity: { duration: 0.5 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="relative w-full max-w-md"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7C3AED]/50 via-[#8B5CF6]/30 to-[#06B6D4]/50 opacity-40 blur transition-opacity duration-700 hover:opacity-70" />
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-shadow duration-500 hover:shadow-[0_20px_80px_rgba(139,92,246,0.3)] sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Welcome back</h1>
                <p className="mt-2 text-sm text-white/50">Sign in to your SmartAttend account to continue.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#8B5CF6]/60 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      aria-required="true"
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-sm text-white placeholder-white/35 outline-none transition focus:border-[#8B5CF6]/60 focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.15)]"
                      placeholder="Password"
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

                {/* Cosmetic only: not wired to auth state or any request. */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 text-white/50">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-[#8B5CF6]"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-[#a5b4fc] underline-offset-2 transition-colors hover:text-white hover:underline">
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(139,92,246,0.35)] transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? "Signing in…" : (
                    <>
                      Login
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Cosmetic only: no route wired up yet. */}
              <p className="mt-6 text-center text-xs text-white/40">
                Don't have an account?{" "}
                <button type="button" className="font-medium text-[#a5b4fc] transition-colors hover:text-white">Sign up</button>
              </p>

              <div className="mt-7 border-t border-white/10 pt-4 text-center text-[11px] text-white/30">
                Demo: admin@smartattend.dev · faculty@smartattend.dev · student1@smartattend.dev (password123)
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}