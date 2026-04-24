"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";

// API response shape
type ApiNotif = {
  id: number;
  type: string;
  template_key: string;
  payload: Record<string, unknown>;
  actor_name?: string;
  push_title: string;
  push_body: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
};

type NotifPage = {
  items: ApiNotif[];
  has_more: boolean;
  next_cursor: number | null;
};

// Display shape (derived from API)
type Notif = {
  id: number;
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

function typeToIcon(type: string): { icon: string; iconBg: string } {
  switch (type) {
    case "rank_up":          return { icon: "trophy",    iconBg: "#BF5AF2" };
    case "habit_milestone":  return { icon: "sparkle",   iconBg: "#5E5CE6" };
    case "partner_nudge":    return { icon: "heart",     iconBg: "#FF375F" };
    case "partner_request":  return { icon: "checkmark", iconBg: "#32ADE6" };
    case "challenge":        return { icon: "calendar",  iconBg: "#FF6B3D" };
    case "steps":            return { icon: "chart",     iconBg: "#30D158" };
    case "leaderboard":      return { icon: "star",      iconBg: "#FFB340" };
    default:                 return { icon: "bell",      iconBg: "#636366" };
  }
}

function formatTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function toDisplayNotif(n: ApiNotif): Notif {
  const { icon, iconBg } = typeToIcon(n.type);
  return {
    id: n.id,
    icon,
    iconBg,
    title: n.push_title,
    body: n.push_body,
    time: formatTime(n.created_at),
    read: n.is_read,
  };
}

function Icon({ type }: { type: string }) {
  switch (type) {
    case "calendar": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="3.5" fill="rgba(255,255,255,0.18)"/>
        <rect x="3" y="5" width="18" height="16" rx="3.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        <path d="M3 10h18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        <path d="M8 3v4M16 3v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8" cy="15" r="1.2" fill="#fff"/>
        <circle cx="12" cy="15" r="1.2" fill="#fff"/>
        <circle cx="16" cy="15" r="1.2" fill="#fff"/>
      </svg>
    );
    case "checkmark": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
        <polyline points="7 12 10.5 15.5 17 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    case "star": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l2.6 7.1H22l-6.1 4.4 2.3 7.1L12 16.8l-6.2 3.8 2.3-7.1L2 9.1h7.4L12 2z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      </svg>
    );
    case "heart": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
      </svg>
    );
    case "chart": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="12" width="4" height="9" rx="1.5" fill="rgba(255,255,255,0.5)"/>
        <rect x="10" y="7" width="4" height="14" rx="1.5" fill="rgba(255,255,255,0.7)"/>
        <rect x="17" y="3" width="4" height="18" rx="1.5" fill="#fff"/>
      </svg>
    );
    case "bell": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="4" r="1.5" fill="#fff"/>
      </svg>
    );
    case "trophy": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M6 4h12v7a6 6 0 01-12 0V4z" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M6 7H3v2a3 3 0 003 3M18 7h3v2a3 3 0 01-3 3" stroke="rgba(255,255,255,0.8)" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M12 17v4M8 21h8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="12" cy="10" r="2" fill="#fff"/>
      </svg>
    );
    case "sparkle": return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.9)"/>
      </svg>
    );
    default: return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="1.5"/>
      </svg>
    );
  }
}

// Gradient map per notification type
const ICON_GRADIENT: Record<string, string> = {
  calendar: "linear-gradient(145deg, #FF8C42 0%, #FF4D00 100%)",
  checkmark: "linear-gradient(145deg, #40B8FF 0%, #0A7AFF 100%)",
  star:      "linear-gradient(145deg, #FFDA2A 0%, #FF9500 100%)",
  heart:     "linear-gradient(145deg, #FF6B8A 0%, #FF2D55 100%)",
  chart:     "linear-gradient(145deg, #5EE87A 0%, #1DB954 100%)",
  bell:      "linear-gradient(145deg, #8E8E93 0%, #48484A 100%)",
  trophy:    "linear-gradient(145deg, #CF9FFF 0%, #9B5DE5 100%)",
  sparkle:   "linear-gradient(145deg, #8B7FF7 0%, #5E5CE6 100%)",
};

export default function NotificationBell() {
  const [open, setOpen]           = useState(false);
  const [notifs, setNotifs]       = useState<Notif[]>([]);
  const [unread, setUnread]       = useState(0);
  const [hasMore, setHasMore]     = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetched, setFetched]     = useState(false);
  const ref     = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch badge count on mount and every 60 s
  useEffect(() => {
    async function fetchBadge() {
      try {
        const data = await api<{ unread: number }>("/api/notifications/unread-count");
        setUnread(data.unread ?? 0);
      } catch { /* ignore */ }
    }
    fetchBadge();
    const t = setInterval(fetchBadge, 60_000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    function outside(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  // Fetch first page when panel opens (once per open)
  useEffect(() => {
    if (!open || fetched) return;
    async function load() {
      try {
        const data = await api<NotifPage>("/api/notifications?limit=20");
        setNotifs(data.items.map(toDisplayNotif));
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
        setFetched(true);
      } catch { /* ignore */ }
    }
    load();
  }, [open, fetched]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || nextCursor === null) return;
    setLoadingMore(true);
    try {
      const data = await api<NotifPage>(`/api/notifications?limit=20&cursor=${nextCursor}`);
      setNotifs((prev) => [...prev, ...data.items.map(toDisplayNotif)]);
      setHasMore(data.has_more);
      setNextCursor(data.next_cursor);
    } catch { /* ignore */ }
    setLoadingMore(false);
  }, [loadingMore, hasMore, nextCursor]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) loadMore();
    }
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  function handleBellClick() {
    if (!open) setFetched(false); // re-fetch on each open
    setOpen((v) => !v);
  }

  function handleClick(n: Notif) {
    if (n.read) return;
    setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    setUnread((prev) => Math.max(0, prev - 1));
    api(`/api/notifications/${n.id}/read`, { method: "PATCH" }).catch(() => {});
  }

  function markAllRead() {
    setNotifs((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    api("/api/notifications/read-all", { method: "PATCH" }).catch(() => {});
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>

      {/* Bell */}
      <button
        onClick={handleBellClick}
        aria-label="Notifications"
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "6px", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "10px", color: "#F2F2F7",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "1px", right: "1px",
            background: "#FF375F",
            color: "#fff", fontSize: "9px", fontWeight: 700,
            borderRadius: "99px", minWidth: "15px", height: "15px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", letterSpacing: "-0.3px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed",
          top: "58px", right: "10px",
          width: "min(360px, calc(100vw - 16px))",
          maxHeight: "520px",
          background: "linear-gradient(170deg, rgba(38,36,48,0.96) 0%, rgba(22,20,30,0.96) 48%, rgba(14,13,20,0.96) 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(194,181,255,0.22)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.78), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 10px 30px rgba(109,79,204,0.22)",
          backdropFilter: "blur(20px) saturate(130%)",
          WebkitBackdropFilter: "blur(20px) saturate(130%)",
          zIndex: 9999,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(140px 120px at 88% 5%, rgba(167,139,245,0.26) 0%, transparent 72%), radial-gradient(180px 130px at 12% 0%, rgba(56,189,248,0.18) 0%, transparent 75%)",
          }} />

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
            position: "relative",
          }}>
            <span style={{ color: "#F8F5FF", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.25px" }}>
              Notifications
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {unread > 0 && (
                <button onClick={markAllRead} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(212,205,235,0.85)", fontSize: "12.5px", padding: "4px 8px",
                  fontWeight: 500, borderRadius: 8,
                }}>
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer",
                color: "#DBD6EC", width: "24px", height: "24px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", padding: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div ref={listRef} style={{ overflowY: "auto", flex: 1, position: "relative" }}>
            {notifs.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "rgba(206,201,221,0.5)", fontSize: "13px" }}>
                No notifications
              </div>
            )}
            {notifs.map((n, i) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: "flex", alignItems: "stretch",
                  borderBottom: i < notifs.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  cursor: n.read ? "default" : "pointer",
                  background: n.read ? "transparent" : "rgba(255,255,255,0.04)",
                  transition: "background 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "transparent" : "rgba(255,255,255,0.04)"; }}
              >
                {/* Vertical accent line */}
                <div style={{
                  width: "3px", flexShrink: 0,
                  borderRadius: "0 2px 2px 0",
                  background: n.read ? "rgba(255,255,255,0.08)" : n.iconBg,
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, padding: "13px 16px 13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "3px" }}>
                    <span style={{
                      color: n.read ? "rgba(255,255,255,0.50)" : "#FFFFFF",
                      fontSize: "13.5px", fontWeight: n.read ? 400 : 600,
                      letterSpacing: "-0.1px", lineHeight: "1.35", flex: 1, minWidth: 0,
                    }}>
                      {n.title}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px", flexShrink: 0 }}>
                      <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "11px", whiteSpace: "nowrap" }}>{n.time}</span>
                      {!n.read && (
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#0A84FF" }} />
                      )}
                    </div>
                  </div>
                  <span style={{
                    color: n.read ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.58)",
                    fontSize: "12.5px", lineHeight: "1.45",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {n.body}
                  </span>
                </div>
              </div>
            ))}
            {loadingMore && (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(206,201,221,0.4)", fontSize: "12px" }}>
                Loading…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
