"use client";

import { useState, useEffect, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState("Fitness");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/challanges");
    }
  }, [router]);

  useEffect(() => {
    const words = ["Fitness", "Connect", "Teams", "Insights"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % words.length;
      setCurrentWord(words[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);

      if (!res.ok) {
        setError(res.error || "Login failed");
        return;
      }

      router.replace("/challanges");
    } catch (err) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: CSSProperties = {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#fafbfc",
    backgroundImage:
      "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.04), transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
  };

  const cardStyle: CSSProperties = {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "14px 16px",
    fontSize: "15px",
    color: "#0f172a",
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    fontWeight: "400",
    opacity: loading ? 0.6 : 1,
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    background: loading
      ? "#e2e8f0"
      : "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    color: loading ? "#94a3b8" : "#ffffff",
    border: "none",
    boxShadow: loading ? "none" : "0 4px 12px 0 rgba(124, 58, 237, 0.25)",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    marginTop: "8px",
  };

  const signupButtonStyle: CSSProperties = {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    background: "transparent",
    color: "#7c3aed",
    border: "1px solid #e2e8f0",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo/Title */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "0",
              letterSpacing: "-0.03em",
              lineHeight: "1",
            }}
          >
            GES {" "}
            <span
              key={currentWord}
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "fadeIn 0.5s ease-in-out",
                display: "inline-block",
              }}
            >
              {currentWord}
            </span>
          </h1>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>

        {/* Login Card */}
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#0f172a",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            Sign in
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "32px" }}>
            Enter your credentials to access your account
          </p>

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0f172a",
                  marginBottom: "10px",
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="enter your email address"
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.08)";
                    e.currentTarget.style.background = "#ffffff";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#f8fafc";
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0f172a",
                  }}
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                disabled={loading}
                style={inputStyle}
                onFocus={(e) => {
                  if (!loading) {
                    e.currentTarget.style.borderColor = "#7c3aed";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.08)";
                    e.currentTarget.style.background = "#ffffff";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#f8fafc";
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#f87171",
                  background: "rgba(248, 113, 113, 0.10)",
                  border: "1px solid rgba(248, 113, 113, 0.20)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 6px 16px 0 rgba(124, 58, 237, 0.35)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.boxShadow = loading
                  ? "none"
                  : "0 4px 12px 0 rgba(124, 58, 237, 0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ position: "relative", margin: "32px 0" }}>
            <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", borderTop: "1px solid #e2e8f0" }} />
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", fontSize: "13px" }}>
              <span
                style={{
                  padding: "0 16px",
                  background: "#ffffff",
                  color: "#64748b",
                  fontWeight: "400",
                }}
              >
                Don&apos;t have an account?
              </span>
            </div>
          </div>

          {/* Signup Button */}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            disabled={loading}
            style={signupButtonStyle}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              if (!loading) {
                e.currentTarget.style.background = "#faf5ff";
                e.currentTarget.style.borderColor = "#c4b5fd";
              }
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            Create account
          </button>
        </div>

        {/* Footer - Fixed */}
        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#94a3b8",
            marginTop: "32px",
            fontWeight: "400",
          }}
        >
          <span>By continuing, you agree to our </span>
          <button
            onClick={(e) => e.preventDefault()}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              textDecoration: "none",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            Terms
          </button>
          <span> and </span>
          <button
            onClick={(e) => e.preventDefault()}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              textDecoration: "none",
              cursor: "pointer",
              padding: 0,
              font: "inherit",
            }}
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}