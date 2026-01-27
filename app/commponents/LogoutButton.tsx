"use client";

import { logout } from "@/lib/auth";

export default function LogoutButton() {
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        background: "#ef4444",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
      }}
    >
      Logout
    </button>
  );
}