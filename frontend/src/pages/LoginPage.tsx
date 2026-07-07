import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-paper)]">
      <div className="hidden lg:flex flex-1 bg-[var(--color-ink)] text-white flex-col justify-between p-12">
        <div className="font-display text-xl font-semibold">SmartAttend</div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-md">
            Attendance, tracked the moment it happens.
          </h1>
          <p className="text-white/50 mt-4 max-w-sm">
            One dashboard for students, faculty, and administrators — real-time attendance,
            reports, and analytics for the whole institution.
          </p>
        </div>
        <div className="text-xs text-white/30">SmartAttend AI · College Attendance Platform</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-[var(--color-muted)] mb-8">
            Use your institution email to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label mb-1 block">Email</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@smartattend.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label mb-1 block">Password</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-[var(--color-danger)] bg-red-50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-xs text-[var(--color-muted)] border-t border-[var(--color-border)] pt-4">
            <p className="font-semibold mb-1">Demo accounts (password: password123)</p>
            <p>admin@smartattend.dev · faculty@smartattend.dev · student1@smartattend.dev</p>
          </div>
        </div>
      </div>
    </div>
  );
}
