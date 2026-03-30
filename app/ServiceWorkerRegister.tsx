"use client";
import { useEffect } from "react";
import { registerServiceWorker } from "./register-sw";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker().catch((err) =>
      console.error("[ServiceWorkerRegister] Unexpected error:", err)
    );
  }, []);
  return null;
}