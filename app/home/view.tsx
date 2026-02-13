"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthed, logout } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  const [currentWord, setCurrentWord] = useState<string>("Fitness");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // ✅ Auth guard
  useEffect(() => {
    if (!isAuthed()) router.replace("/login");
  }, [router]);

  // Animated word loop
  useEffect(() => {
    const words = ["Fitness", "Connect", "Social", "Insights"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % words.length;
      setCurrentWord(words[index]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const categories = ["All", "Trending", "Popular", "New"];

  const trendingTopics = [
    { id: 1, title: "Summer Fitness Challenge", category: "Fitness", image: "🏃", participants: "234 joined" },
    { id: 2, title: "Team Building Event", category: "Social", image: "🎉", participants: "89 interested" },
    { id: 3, title: "Q2 Performance Review", category: "Tasks", image: "📈", participants: "156 completed" },
    { id: 4, title: "Wellness Wednesday", category: "Wellness", image: "🧘", participants: "67 participating" },
  ];

  const modules = [
    { id: "fitness", icon: "💪", title: "Fitness", description: "Track your health and wellness", color: "#7c3aed" },
    { id: "wellness", icon: "🧘", title: "Wellness", description: "Mental health and mindfulness", color: "#06b6d4" },
    { id: "announcements", icon: "📢", title: "Announcements", description: "Company news and updates", color: "#f97316" },
    { id: "tasks", icon: "✅", title: "Tasks", description: "Projects and collaboration", color: "#10b981" },
  ];

  const handleModuleClick = (moduleId: string) => {
    // ✅ Real routing map (V1)
    if (moduleId === "fitness") return router.push("/steps");
    if (moduleId === "wellness") return router.push("/bmi");

    // placeholders for future
    if (moduleId === "announcements") return router.push("/home");
    if (moduleId === "tasks") return router.push("/home");
  };

  const handleTopicClick = (topicId: number) => {
    // ✅ V1: send to leaderboard (or later /topic/[id])
    router.push("/leaderboard");
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", backgroundColor: "#0f172a", padding: "0" }}>
      {/* Hero Section - Netflix Style */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 1) 100%)",
          padding: "24px",
          paddingBottom: "32px",
        }}
      >
        {/* Top Bar: Logo + Logout */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          {/* Logo */}
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: "0",
                letterSpacing: "-0.02em",
              }}
            >
              GES{" "}
              <span
                key={currentWord}
                style={{
                  background: "linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)",
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
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255, 255, 255, 0.10)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.10)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Featured Card - Hero */}
        <div
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
            borderRadius: "16px",
            padding: "32px 24px",
            marginBottom: "24px",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => router.push("/steps")}
        >
          <div style={{ position: "absolute", top: "-50px", right: "-50px", fontSize: "120px", opacity: "0.15" }}>
            💪
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-block",
                background: "rgba(255, 255, 255, 0.2)",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Featured
            </div>

            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              30-Day Fitness Challenge
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              Join your team in the ultimate fitness journey
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "rgba(255, 255, 255, 0.8)" }}>
              <span>🔥 234 active</span>
              <span>⏱️ 12 days left</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            marginBottom: "16px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: selectedCategory === cat ? "#7c3aed" : "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trending Topics */}
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "12px" }}>Trending Now</h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "4px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                style={{
                  minWidth: "160px",
                  background: "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{topic.image}</div>
                <h4 style={{ fontSize: "13px", fontWeight: "600", color: "#ffffff", marginBottom: "4px", lineHeight: "1.3" }}>
                  {topic.title}
                </h4>
                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", marginBottom: "0" }}>{topic.participants}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#ffffff", marginBottom: "16px" }}>Explore Modules</h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: module.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "12px",
                }}
              >
                {module.icon}
              </div>

              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                  {module.title}
                </h3>

                <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", lineHeight: "1.4", marginBottom: "0" }}>
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", paddingTop: "24px", paddingBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.4)", fontWeight: "400" }}>More modules coming soon</p>
        </div>
      </div>
    </div>
  );
}
