"use client";
import { useEffect } from "react";
import { registerServiceWorker } from "./register-sw";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    console.log("Registering service worker...");
    registerServiceWorker();
  }, []);
  return null;
}