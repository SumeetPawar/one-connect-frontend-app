// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    isAuthed().then((authed) => {
      console.log("User is", authed ? "authenticated" : "not authenticated");
      router.replace(authed ? "/goals" : "/login");
    });
  }, [router]);
  return null;
}
