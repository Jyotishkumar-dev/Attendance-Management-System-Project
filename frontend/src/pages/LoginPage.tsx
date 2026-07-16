import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  Activity,
  BarChart3,
  ShieldCheck,
  Cloud,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  useAnimationControls,
  type Variants,
} from "framer-motion";
import { useAuth } from "../context/AuthContext";

/* ------------------------------------------------------------------ */
/* Constants & pure helpers (module scope so identities stay stable)   */
/* ------------------------------------------------------------------ */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isLikelyValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());
const isLikelyValidPassword = (value: string) => value.trim().length >= 6;

const FEATURES: { icon: typeof Activity; title: string; description: string }[] = [
  {
    icon: Activity,
    title: "Real-Time Attendance",
    description: "Live sync across every classroom, the moment it happens.",
  },
  {
    icon: BarChart3,
    title: "AI-Powered Insights",
    description: "Predictive analytics that flag patterns before they become problems.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description: "Role-based access across five institutional access levels.",
  },
  {
    icon: Cloud,
    title: "Cloud Native",
    description: "Deploy once, scale to every department without friction.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const SORA_FONT = "'Sora', ui-sans-serif, system-ui, sans-serif";

/* ------------------------------------------------------------------ */
/* Shared pointer-tracking hook                                        */
/* ------------------------------------------------------------------ */

/**
 * Normalized (0..1) pointer position relative to whatever element attaches
 * onPointerMove. Used independently for the page-wide ambient glow and for
 * the login card's tilt effect — each call creates its own motion values,
 * so the two usages never interfere with each other.
 */
function useNormalizedPointer(reduceMotion: boolean) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width);
      y.set((e.clientY - rect.top) / rect.height);
    },
    [x, y, reduceMotion]
  );

  return { x, y, onPointerMove };
}

/* ------------------------------------------------------------------ */
/* Gradient text — reused for the brand wordmark and footer name       */
/* ------------------------------------------------------------------ */

const GradientText = memo(function GradientText({
  children,
  className = "",
  durationSec = 6,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  durationSec?: number;
  style?: React.CSSProperties;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  return (
    <motion.span
      className={`bg-gradient-to-r from-[#a855f7] via-[#8b5cf6] to-[#22d3ee] bg-clip-text text-transparent ${className}`}
      style={{ backgroundSize: "200% auto", ...style }}
      animate={
        reduceMotion
          ? { backgroundPosition: "50% 50%" }
          : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
      }
      transition={reduceMotion ? undefined : { duration: durationSec, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
});

/* ------------------------------------------------------------------ */
/* Brand mark                                                           */
/* ------------------------------------------------------------------ */

function BrandLogo({ size = 34, reduceMotion }: { size?: number; reduceMotion: boolean }) {
  return (
    <div className="group relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7C3AED]/50 via-[#8B5CF6]/50 to-[#06B6D4]/50 blur-md"
        animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.25, 0.6, 0.25] }}
        transition={reduceMotion ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 40 40" width={size} height={size} className="relative">
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
        <path
          d="M12 21 L18 27 L28 15"
          stroke="url(#brandGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
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
          className={reduceMotion ? undefined : "origin-center animate-[spin_18s_linear_infinite]"}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient background: aurora, mesh gradient, grid, particles, glow    */
/* ------------------------------------------------------------------ */

function AmbientBackground({
  reduceMotion,
  glowX,
  glowY,
}: {
  reduceMotion: boolean;
  glowX: ReturnType<typeof useMotionValue<number>>;
  glowY: ReturnType<typeof useMotionValue<number>>;
}) {
  const springX = useSpring(glowX, { stiffness: 60, damping: 20, mass: 0.6 });
  const springY = useSpring(glowY, { stiffness: 60, damping: 20, mass: 0.6 });
  const glowBackground = useMotionTemplate`radial-gradient(560px circle at ${useTransform(
    springX,
    (v) => v * 100
  )}% ${useTransform(springY, (v) => v * 100)}%, rgba(139,92,246,0.16), transparent 45%)`;

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 1000) / 10,
        top: Math.round(Math.random() * 1000) / 10,
        delay: Math.round(Math.random() * 500) / 100,
        duration: 7 + Math.round(Math.random() * 500) / 100,
        size: 2 + Math.round(Math.random() * 20) / 10,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Static mesh gradient — deliberately not animated; it's the cheap,
          always-on lighting base layer, while the aurora blobs below carry
          all the motion. Keeping this static avoids paying continuous
          compositing cost for a layer that barely reads as "moving" anyway. */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(at 20% 20%, rgba(124,58,237,0.25), transparent 50%), radial-gradient(at 80% 0%, rgba(6,182,212,0.2), transparent 50%), radial-gradient(at 50% 100%, rgba(139,92,246,0.2), transparent 50%)",
        }}
      />

      {/* Aurora blobs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#7C3AED]/25 blur-3xl"
        animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={reduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#06B6D4]/20 blur-3xl"
        animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.3, 0.55, 0.3], scale: [1, 1.05, 1] }}
        transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#8B5CF6]/20 blur-3xl"
        animate={reduceMotion ? { opacity: 0.55 } : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.04, 1] }}
        transition={reduceMotion ? undefined : { duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Animated grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:48px_48px]"
        animate={reduceMotion ? undefined : { backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, ease: "linear" }}
      />

      {/* Mouse-follow glow */}
      {reduceMotion ? (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(560px circle at 50% 40%, rgba(139,92,246,0.14), transparent 45%)" }}
        />
      ) : (
        <motion.div className="absolute inset-0" style={{ background: glowBackground }} />
      )}

      {/* Floating particles */}
      {particles.map((p) =>
        reduceMotion ? (
          <span
            key={p.id}
            className="absolute rounded-full bg-white/30"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          />
        ) : (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white/30"
            style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
            animate={{ opacity: [0, 0.7, 0], y: [0, -36, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        )
      )}

      {/* Soft static noise texture — not animated: one-time rasterization only */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Left panel: branding, headline, feature cards                       */
/* ------------------------------------------------------------------ */

const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
  reduceMotion,
}: {
  icon: typeof Activity;
  title: string;
  description: string;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      whileHover={{
        y: -5,
        borderColor: "rgba(139,92,246,0.5)",
        boxShadow: "0 16px 40px -12px rgba(139,92,246,0.35)",
      }}
      className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md transition-colors duration-300"
    >
      <motion.span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#7C3AED]/25 to-[#06B6D4]/25 text-[#a5b4fc] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
        transition={reduceMotion ? undefined : { duration: 4 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
      >
        <Icon size={21} aria-hidden="true" />
      </motion.span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/50">{description}</p>
      </div>
      <ArrowRight
        size={16}
        aria-hidden="true"
        className="mt-1 shrink-0 -translate-x-2 text-[#a5b4fc] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </motion.div>
  );
});

/**
 * Extra depth layered behind the left panel's content only. The shared
 * AmbientBackground already covers the whole page — this adds panel-local
 * richness (a drifting gradient blob, a localized aurora blob, and a bottom
 * mesh wave) without duplicating or fighting the page-wide layer. Kept to
 * transform/opacity animations throughout to stay GPU-cheap.
 */
function LeftPanelDepth({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-[#8B5CF6]/20 blur-3xl"
        animate={
          reduceMotion
            ? { opacity: 0.4 }
            : { x: [0, 40, -20, 0], y: [0, -30, 15, 0], opacity: [0.25, 0.45, 0.3, 0.25] }
        }
        transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-16 bottom-1/4 h-64 w-64 rounded-full bg-[#06B6D4]/15 blur-3xl"
        animate={reduceMotion ? { opacity: 0.4 } : { opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
        transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <svg
        className="absolute inset-x-0 bottom-0 h-40 w-full"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="meshWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,70 C100,20 300,110 400,55 L400,120 L0,120 Z"
          fill="url(#meshWaveGrad)"
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

function LeftPanel({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative hidden h-full flex-col px-14 pt-32 xl:flex xl:px-20">
      <LeftPanelDepth reduceMotion={reduceMotion} />

      {/*
        No repeated logo/wordmark here — the corner lockup already carries
        brand identity, and duplicating it as the first item in this
        vertically-centered block was what caused it to visually collide
        with the fixed corner lockup on shorter viewports. pt-32 above also
        guarantees clearance regardless of content height.
      */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-1 flex-col justify-center"
      >
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="max-w-lg text-6xl font-bold leading-[1.05] tracking-tight text-white"
          style={{ fontFamily: SORA_FONT }}
        >
          Welcome to{" "}
          <GradientText durationSec={7} style={{ fontFamily: SORA_FONT }}>
            SmartAttend
          </GradientText>
        </motion.h1>
        <motion.p variants={fadeUp} transition={{ duration: 0.6 }} className="mt-5 max-w-sm text-lg text-white/50">
          AI Powered Attendance Management Platform
        </motion.p>

        <div className="mt-12 grid max-w-lg gap-5">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} reduceMotion={reduceMotion} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Center divider: glowing beam + pulsing orb                          */
/* ------------------------------------------------------------------ */

function CenterDivider({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative hidden w-px shrink-0 xl:block" aria-hidden="true">
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#8B5CF6]/50 to-transparent" />
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#67e8f9]/70 to-transparent"
        animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.3, 0.8, 0.3] }}
        transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a5b4fc]"
        style={{ boxShadow: "0 0 24px 6px rgba(139,92,246,0.55)" }}
        animate={reduceMotion ? { opacity: 0.8 } : { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
        transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable floating-label input                                       */
/* ------------------------------------------------------------------ */

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type: string;
  icon: typeof Mail;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  isValid?: (value: string) => boolean;
  rightSlot?: React.ReactNode;
  invalid?: boolean;
}

const FloatingLabelInput = memo(function FloatingLabelInput({
  id,
  label,
  type,
  icon: Icon,
  value,
  onChange,
  autoComplete,
  isValid,
  rightSlot,
  invalid,
}: FloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const valid = Boolean(isValid && value.length > 0 && isValid(value));

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border shadow-inner shadow-black/20 backdrop-blur-md transition-all duration-300 ${
          invalid
            ? "border-red-400/60 bg-red-500/[0.06]"
            : focused
              ? "border-[#8B5CF6]/70 bg-black/30 shadow-[0_0_0_4px_rgba(139,92,246,0.16)]"
              : "border-white/10 bg-black/20"
        }`}
      >
        <Icon
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
            focused ? "text-[#a5b4fc]" : "text-white/40"
          }`}
          size={18}
          aria-hidden="true"
        />

        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          aria-required="true"
          placeholder=" "
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="peer w-full rounded-xl bg-transparent py-3.5 pl-12 pr-12 text-sm text-white outline-none"
        />

        <motion.label
          htmlFor={id}
          className="pointer-events-none absolute left-12 origin-left select-none text-white/40"
          animate={
            floated
              ? { top: "0.35rem", scale: 0.72, color: focused ? "#c4b5fd" : "rgba(255,255,255,0.45)" }
              : { top: "50%", scale: 1 }
          }
          initial={false}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{ translateY: floated ? 0 : "-50%" }}
        >
          {label}
        </motion.label>

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <AnimatePresence initial={false}>
            {valid && !rightSlot && (
              <motion.span
                key="valid"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="text-emerald-400"
              >
                <Check size={16} aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          {rightSlot}
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // UI-only state. None of it is read by handleSubmit or sent anywhere.
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);

  const { x: glowX, y: glowY, onPointerMove: onPageMove } = useNormalizedPointer(reduceMotion);
  const { x: tiltX, y: tiltY, onPointerMove: onCardMove } = useNormalizedPointer(reduceMotion);

  const rotateX = useSpring(useTransform(tiltY, [0, 1], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(tiltX, [0, 1], [-6, 6]), { stiffness: 150, damping: 20 });

  const formShakeControls = useAnimationControls();

  useEffect(() => {
    const linkId = "smartattend-font-sora";
    if (document.getElementById(linkId)) return;
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (error && !reduceMotion) {
      formShakeControls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } });
    }
  }, [error, reduceMotion, formShakeControls]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);

  const handleCardPointerLeave = useCallback(() => {
    tiltX.set(0.5);
    tiltY.set(0.5);
  }, [tiltX, tiltY]);

  const handleButtonPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (loading) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const id = rippleId.current++;
      setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    },
    [loading]
  );

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

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
    <div
      className="smartattend-login relative min-h-screen overflow-hidden bg-[#0b0c14] font-sans"
      onPointerMove={onPageMove}
    >
      {/* Scoped so it never leaks into other pages sharing this SPA document. */}
      <style>{`
        .smartattend-login input:-webkit-autofill,
        .smartattend-login input:-webkit-autofill:hover,
        .smartattend-login input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0px 1000px rgba(10, 11, 18, 0.92) inset;
          box-shadow: 0 0 0px 1000px rgba(10, 11, 18, 0.92) inset;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      <AmbientBackground reduceMotion={reduceMotion} glowX={glowX} glowY={glowY} />

      <div className="absolute top-6 left-6 z-20 flex items-center gap-3.5 sm:top-8 sm:left-8">
        <BrandLogo size={34} reduceMotion={reduceMotion} />
        <div className="flex flex-col justify-center whitespace-nowrap">
          <GradientText
            className="block text-base font-bold leading-none tracking-tight"
            style={{ fontFamily: SORA_FONT }}
          >
            SMARTATTEND
          </GradientText>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-1 block text-[11px] leading-none tracking-wide text-white/40"
          >
            AI Powered Attendance Platform
          </motion.span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-stretch justify-center">
        <LeftPanel reduceMotion={reduceMotion} />
        <CenterDivider reduceMotion={reduceMotion} />

        <div className="flex w-full flex-col items-center justify-center px-4 py-10 xl:w-[46%] xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: reduceMotion ? 0 : [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.5 },
              y: reduceMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative w-full max-w-md"
            style={{ perspective: 1200 }}
            onPointerMove={onCardMove}
            onPointerLeave={handleCardPointerLeave}
          >
            {/* Ambient halo — soft, wide glow behind the card */}
            <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-gradient-to-br from-[#7C3AED]/40 via-[#8B5CF6]/25 to-[#06B6D4]/40 opacity-50 blur-2xl transition-opacity duration-700 hover:opacity-80" />

            {/* Crisp 1.5px gradient border via the padding-box technique, tilts with the pointer */}
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] p-[1.5px] shadow-[0_25px_90px_rgba(0,0,0,0.6)]"
            >
              <div className="relative overflow-hidden rounded-[15px] bg-[#0d0e17]/85 p-10 backdrop-blur-3xl transition-shadow duration-500 hover:shadow-[0_20px_90px_rgba(139,92,246,0.35)] sm:p-12">
                {/* Reflection sweep — one-shot on hover, not a continuous loop */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-1000 hover:translate-x-full" />

                <div className="mb-10 text-center">
                  <h1 className="text-2xl font-semibold text-white sm:text-3xl" style={{ fontFamily: SORA_FONT }}>
                    Welcome back
                  </h1>
                  <p className="mt-2.5 text-sm text-white/50">Sign in to your SmartAttend account to continue.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <motion.div animate={formShakeControls} className="space-y-6">
                  <FloatingLabelInput
                    id="email"
                    label="Email address"
                    type="email"
                    icon={Mail}
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    isValid={isLikelyValidEmail}
                    invalid={Boolean(error)}
                  />

                  <FloatingLabelInput
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    icon={Lock}
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    isValid={isLikelyValidPassword}
                    invalid={Boolean(error)}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="text-white/40 transition-colors hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                </motion.div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label htmlFor="rememberMe" className="flex cursor-pointer items-center gap-2 text-white/50">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-4 w-4 rounded border border-white/25 bg-white/10 transition-colors peer-checked:border-[#8B5CF6] peer-checked:bg-gradient-to-br peer-checked:from-[#7C3AED] peer-checked:to-[#06B6D4]" />
                      <AnimatePresence>
                        {rememberMe && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 flex items-center justify-center text-white"
                          >
                            <Check size={11} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="relative text-[#a5b4fc] transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[#a5b4fc] after:transition-all after:duration-300 hover:text-white hover:after:w-full"
                  >
                    Forgot password?
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      role="alert"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  onPointerDown={handleButtonPointerDown}
                  whileHover={loading ? undefined : { scale: 1.01 }}
                  whileTap={loading ? undefined : { scale: 0.98 }}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4] py-4 text-sm font-semibold text-white shadow-[0_10px_30px_-5px_rgba(139,92,246,0.45),0_0_50px_-15px_rgba(6,182,212,0.4)] transition-shadow duration-500 hover:shadow-[0_14px_40px_-5px_rgba(139,92,246,0.55),0_0_70px_-15px_rgba(6,182,212,0.5)] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundSize: "200% auto" }}
                  animate={reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={reduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 blur-md transition-transform duration-700 group-hover:translate-x-full" />

                  <AnimatePresence>
                    {ripples.map((r) => (
                      <motion.span
                        key={r.id}
                        className="pointer-events-none absolute rounded-full bg-white/40"
                        style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 18, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        onAnimationComplete={() => removeRipple(r.id)}
                      />
                    ))}
                  </AnimatePresence>

                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 size={16} className={reduceMotion ? undefined : "animate-spin"} />
                        Signing in…
                      </motion.span>
                    ) : loginSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={16} />
                        Success
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        Login
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <span aria-live="polite" className="sr-only">
                  {loading ? "Signing in, please wait." : error ? error : ""}
                </span>
              </form>

              <p className="mt-6 text-center text-xs text-white/40">
                Don't have an account?{" "}
                <button type="button" className="font-medium text-[#a5b4fc] transition-colors hover:text-white">
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
          </motion.div>

          {/* Premium footer glass panel — its own distinct chip below the
              card, matching the Linear/Vercel "credit pill" pattern, rather
              than a plain border-top line buried inside the card. */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[11px] text-white/40 backdrop-blur-md"
          >
            Designed &amp; Developed by{" "}
            <GradientText className="font-semibold" durationSec={5}>
              JYOTISH VERMA
            </GradientText>
          </motion.div>
        </div>
      </div>
    </div>
  );
}