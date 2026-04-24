// @ts-nocheck
"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const C = {
  bg:     "#0F0F11",
  card:   "#1A1A1C",
  surf:   "#242426",
  input:  "#2C2C2E",
  hi:     "#3A3A3C",
  t1:     "#F2F2F7",
  t2:     "#AEAEB2",
  t3:     "#636366",
  t4:     "#3A3A3C",
  bdr:    "rgba(255,255,255,0.065)",
  bdrM:   "rgba(255,255,255,0.13)",
  accent: "#9D82FF",
  green:  "#4CD97B",
  red:    "#FF3B30",
};

const API = "https://cbiqa.dev.honeywellcloud.com/socialapi";

/* ── post types — post/announcement/tip/celebration merged ── */
const FEED_TYPES = [
  {
    id: "post", label: "Post", icon: "✦", color: "#9D82FF",
    labelOpts: ["Post","Announcement","Tip","Celebration"],
  },
  { id: "event", label: "Event", icon: "📅", color: "#5DCFFF", labelOpts: null },
  { id: "poll",  label: "Poll",  icon: "📊", color: "#FF5C87", labelOpts: null },
  { id: "form",  label: "Form",  icon: "📋", color: "#FF9F0A", labelOpts: null },
];

const POST_LABEL_ICONS: Record<string, string> = {
  Post: "✏️", Announcement: "📢", Tip: "💡", Celebration: "🎉",
};

/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtB = (b: number) => b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(0)}KB` : `${(b/1048576).toFixed(1)}MB`;
const getToken = () => typeof window !== "undefined"
  ? (localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || "") : "";

/* ══════════════════════════════════════════════════════════
   BLOCK MODEL
══════════════════════════════════════════════════════════ */
type BlockType = "heading" | "subheading" | "body" | "image" | "list" | "quote";
type Block = {
  id: string;
  type: BlockType;
  html?: string;
  items?: string[];
  ordered?: boolean;
  src?: string;
  localPreview?: string;
  uploadedUrl?: string;
  alt?: string;
  caption?: string;
  status?: "pending" | "uploading" | "done" | "error";
};

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  heading:    { fontSize: 22, fontWeight: 700, color: C.t1, letterSpacing: "-0.025em", lineHeight: 1.25 },
  subheading: { fontSize: 17, fontWeight: 600, color: C.t1, letterSpacing: "-0.015em", lineHeight: 1.35 },
  body:       { fontSize: 15, fontWeight: 400, color: C.t2, letterSpacing: "-0.01em",  lineHeight: 1.7  },
};

/* ══════════════════════════════════════════════════════════
   CLIPBOARD PARSER  (from 021articlecomposer reference)
══════════════════════════════════════════════════════════ */
function detectLevel(node: Element): "heading" | "subheading" | "body" {
  const tag = node.tagName?.toLowerCase();
  if (!tag) return "body";
  if (tag === "h1" || tag === "h2") return "heading";
  if (tag === "h3" || tag === "h4" || tag === "h5") return "subheading";
  const style = node.getAttribute?.("style") || "";
  const m = style.match(/font-size\s*:\s*([\d.]+)(pt|px|em|rem)/i);
  if (m) {
    let px = parseFloat(m[1]);
    const u = m[2].toLowerCase();
    if (u === "pt") px *= 1.333;
    if (u === "em" || u === "rem") px *= 16;
    if (px >= 20) return "heading";
    if (px >= 16) return "subheading";
  }
  return "body";
}

function cleanInline(node: Element): string {
  function walk(n: Node): string {
    if (n.nodeType === Node.TEXT_NODE) return n.textContent ?? "";
    if (n.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = (n as Element).tagName.toLowerCase();
    const ch = Array.from(n.childNodes).map(walk).join("");
    if (tag === "b" || tag === "strong") return `<b>${ch}</b>`;
    if (tag === "i" || tag === "em") return `<i>${ch}</i>`;
    if (tag === "u") return `<u>${ch}</u>`;
    if (tag === "a") {
      const href = (n as Element).getAttribute("href");
      return href ? `<a href="${href}" target="_blank" rel="noopener" style="color:${C.accent};text-decoration:underline">${ch}</a>` : ch;
    }
    if (tag === "br") return "<br>";
    return ch;
  }
  return walk(node).trim();
}

function parseHTMLToBlocks(html: string): Block[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks: Block[] = [];

  function walkNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return;
      const last = blocks[blocks.length - 1];
      if (last?.type === "body") { last.html += " " + text; }
      else blocks.push({ id: uid(), type: "body", html: text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === "img") {
      const src = el.getAttribute("src");
      if (src && !src.startsWith("data:image/gif")) {
        blocks.push({ id: uid(), type: "image", src, alt: el.getAttribute("alt") || "",
          localPreview: src.startsWith("data:") ? src : undefined, status: "pending" });
      }
      return;
    }
    if (tag === "figure") {
      const img = el.querySelector("img");
      if (img) {
        const src = img.getAttribute("src");
        if (src) blocks.push({ id: uid(), type: "image", src, alt: img.getAttribute("alt") || "",
          caption: el.querySelector("figcaption")?.textContent?.trim() || "",
          localPreview: src.startsWith("data:") ? src : undefined, status: "pending" });
      }
      return;
    }
    if (/^h[1-6]$/.test(tag)) {
      const h = cleanInline(el);
      if (h.trim()) blocks.push({ id: uid(), type: tag === "h1" || tag === "h2" ? "heading" : "subheading", html: h });
      return;
    }
    if (tag === "ul" || tag === "ol") {
      const items = Array.from(el.querySelectorAll("li")).map(li => cleanInline(li)).filter(Boolean);
      if (items.length) blocks.push({ id: uid(), type: "list", ordered: tag === "ol", items });
      return;
    }
    if (tag === "blockquote") {
      const h = cleanInline(el);
      if (h.trim()) blocks.push({ id: uid(), type: "quote", html: h });
      return;
    }
    if (["p","div","section","article"].includes(tag)) {
      if (el.querySelector("img")) { for (const c of el.childNodes) walkNode(c); return; }
      const level = detectLevel(el);
      const h = cleanInline(el);
      if (h.trim()) blocks.push({ id: uid(), type: level, html: h });
      return;
    }
    for (const c of el.childNodes) walkNode(c);
  }

  for (const c of doc.body.childNodes) walkNode(c);

  /* merge adjacent body blocks */
  const merged: Block[] = [];
  for (const b of blocks) {
    const last = merged[merged.length - 1];
    if (last && last.type === "body" && b.type === "body") { last.html += " " + b.html; continue; }
    merged.push({ ...b });
  }
  return merged;
}

/* ══════════════════════════════════════════════════════════
   RICH TEXT TOOLBAR
══════════════════════════════════════════════════════════ */
function TBtn({ label, title, onCmd, active }: { label: React.ReactNode; title: string; onCmd: () => void; active?: boolean }) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onCmd(); }}
      style={{
        width: 30, height: 30, borderRadius: 7, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? C.hi : "none", color: active ? C.t1 : C.t2,
        fontSize: 12, fontWeight: 600, flexShrink: 0, transition: "background .1s, color .1s",
      }}
    >{label}</button>
  );
}

function RichToolbar({ editorRef, fileRef, uploadImage }: {
  editorRef: React.RefObject<HTMLDivElement>;
  fileRef: React.RefObject<HTMLInputElement>;
  uploadImage: (file: File) => void;
}) {
  const [fmt, setFmt] = useState<Record<string,boolean>>({});
  useEffect(() => {
    const update = () => setFmt({
      bold:      document.queryCommandState("bold"),
      italic:    document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul:        document.queryCommandState("insertUnorderedList"),
      ol:        document.queryCommandState("insertOrderedList"),
    });
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);
  const cmd = (c: string, v?: string) => { editorRef.current?.focus(); document.execCommand(c, false, v); };
  const blk = (tag: string) => { editorRef.current?.focus(); document.execCommand("formatBlock", false, tag); };
  const Sep = () => <div style={{ width:1, height:16, background:C.bdr, flexShrink:0, margin:"0 2px" }} />;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, flexWrap:"wrap",
      padding:"6px 10px", borderBottom:`1px solid ${C.bdr}` }}>
      <TBtn label="H1" title="Heading 1" onCmd={() => blk("h2")} />
      <TBtn label="H2" title="Heading 2" onCmd={() => blk("h3")} />
      <TBtn label="¶"  title="Body paragraph" onCmd={() => blk("p")} />
      <Sep />
      <TBtn active={fmt.bold} title="Bold" onCmd={() => cmd("bold")} label={
        <svg width={11} height={12} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h8a4 4 0 0 1 0 8H6zm0 8h9a4 4 0 0 1 0 8H6z"/>
        </svg>} />
      <TBtn active={fmt.italic} title="Italic" onCmd={() => cmd("italic")} label={
        <svg width={10} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
        </svg>} />
      <TBtn active={fmt.underline} title="Underline" onCmd={() => cmd("underline")} label={
        <svg width={12} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/>
        </svg>} />
      <Sep />
      <TBtn active={fmt.ul} title="Bullet list" onCmd={() => cmd("insertUnorderedList")} label={
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>} />
      <TBtn active={fmt.ol} title="Numbered list" onCmd={() => cmd("insertOrderedList")} label={
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
          <path d="M4 6h1V3M4 12c0-1 2-1 2 0s-2 2-2 2h2M5 18v-2h1v1h-1v1h1" stroke="currentColor" strokeWidth="1.5"/>
        </svg>} />
      <Sep />
      <TBtn title="Blockquote" onCmd={() => blk("blockquote")} label={
        <svg width={13} height={11} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>} />
      <TBtn title="Insert image" onCmd={() => fileRef.current?.click()} label={
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════ */
const Ico = {
  trash: (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  ),
  check: (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  eye: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  edit: (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════════
   BLOCK EDITOR ROW
══════════════════════════════════════════════════════════ */
function BlockRow({ block, onUpdate, onDelete }: {
  block: Block; onUpdate: (id: string, u: Partial<Block>) => void; onDelete: (id: string) => void;
}) {
  const isText   = ["heading", "subheading", "body"].includes(block.type);
  const isImage  = block.type === "image";
  const isList   = block.type === "list";
  const isQuote  = block.type === "quote";

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.22,1,0.36,1] }}
      className="block-row"
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "3px 0", position: "relative" }}
    >
      {/* type pill */}
      <div style={{ paddingTop: isText ? 5 : 8, flexShrink: 0, opacity: 0, transition: "opacity .15s" }} className="brow-meta">
        {isText && (
          <select value={block.type}
            onChange={e => onUpdate(block.id, { type: e.target.value as BlockType })}
            style={{ background: C.hi, border: "none", borderRadius: 6, color: C.t3,
              fontSize: 10, fontWeight: 700, padding: "3px 4px", cursor: "pointer",
              outline: "none", textTransform: "uppercase", letterSpacing: .5 }}>
            <option value="heading">H1</option>
            <option value="subheading">H2</option>
            <option value="body">¶</option>
          </select>
        )}
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isText && (
          <div
            contentEditable suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: block.html ?? "" }}
            onInput={e => onUpdate(block.id, { html: (e.currentTarget as HTMLDivElement).innerHTML })}
            style={{
              outline: "none", caretColor: C.accent, padding: "2px 0",
              minHeight: "1.5em", wordBreak: "break-word",
              WebkitFontSmoothing: "antialiased",
              ...TYPE_STYLE[block.type],
            }}
          />
        )}

        {isImage && (
          <div style={{ borderRadius: 14, overflow: "hidden", background: C.surf, position: "relative" }}>
            {block.status === "uploading" && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: C.surf, zIndex: 3 }}>
                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                  style={{ height: "100%", background: `linear-gradient(90deg, ${C.accent}, #6DD8FF)` }} />
              </div>
            )}
            {(block.uploadedUrl || block.localPreview) && (
              <img src={block.uploadedUrl || block.localPreview} alt={block.alt}
                style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "cover" }} />
            )}
            {!block.uploadedUrl && !block.localPreview && block.status === "pending" && (
              <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.t3, fontSize: 12 }}>Queued for upload…</span>
              </div>
            )}
            {/* status badge */}
            <div style={{
              position: "absolute", bottom: 8, right: 8, padding: "4px 8px",
              borderRadius: 99, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
              background: block.status === "done" ? "rgba(76,217,123,.92)"
                : block.status === "uploading" ? "rgba(157,130,255,.92)"
                : block.status === "error" ? "rgba(255,59,48,.85)"
                : "rgba(0,0,0,.7)",
              color: ["done","uploading"].includes(block.status!) ? "#0A0A0C" : "#fff",
            }}>
              {block.status === "uploading" && <motion.span animate={{ rotate: 360 }} transition={{ duration:.9, repeat:Infinity, ease:"linear" }} style={{ display:"inline-block" }}>↻</motion.span>}
              {block.status === "done" && Ico.check}
              {block.status === "uploading" ? " Uploading" : block.status === "done" ? " CDN" : block.status === "error" ? " Failed" : " Pending"}
            </div>
            {block.caption !== undefined && (
              <div contentEditable suppressContentEditableWarning
                onInput={e => onUpdate(block.id, { caption: (e.currentTarget as HTMLDivElement).textContent ?? "" })}
                style={{ padding: "6px 12px", fontSize: 12, color: C.t3, fontStyle: "italic",
                  outline: "none", background: C.card, minHeight: "1.4em", caretColor: C.accent }}>
                {block.caption || ""}
              </div>
            )}
          </div>
        )}

        {isList && (
          <ul style={{ paddingLeft: 20, margin: "2px 0" }}>
            {(block.items ?? []).map((item, i) => (
              <li key={i} style={{ ...TYPE_STYLE.body, marginBottom: 3 }}
                dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        )}

        {isQuote && (
          <div contentEditable suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: block.html ?? "" }}
            onInput={e => onUpdate(block.id, { html: (e.currentTarget as HTMLDivElement).innerHTML })}
            style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 14, outline: "none",
              caretColor: C.accent, ...TYPE_STYLE.body, fontStyle: "italic" }} />
        )}
      </div>

      {/* delete */}
      <button onClick={() => onDelete(block.id)} className="brow-del"
        style={{ width: 26, height: 26, borderRadius: 8, border: "none", flexShrink: 0, marginTop: 4,
          background: "rgba(255,59,48,.12)", color: "#FF6060", display: "flex",
          alignItems: "center", justifyContent: "center", cursor: "pointer",
          opacity: 0, transition: "opacity .15s" }}>
        {Ico.trash}
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   BLOCK PREVIEW
══════════════════════════════════════════════════════════ */
function BlockPreview({ blocks, title, postLabel }: { blocks: Block[]; title: string; postLabel: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 20, overflow: "hidden",
      boxShadow: `0 4px 32px rgba(0,0,0,.45), 0 0 0 1px ${C.bdr}` }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)` }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.accent}, #C39FFF)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>You</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>You</div>
          <div style={{ fontSize: 11, color: C.t3 }}>just now</div>
        </div>
        <div style={{ marginLeft: "auto", padding: "3px 9px", borderRadius: 99,
          background: `${C.accent}22`, fontSize: 10, fontWeight: 700,
          color: C.accent, letterSpacing: ".05em" }}>
          {POST_LABEL_ICONS[postLabel]} {postLabel.toUpperCase()}
        </div>
      </div>
      <div style={{ padding: "2px 16px 20px" }}>
        {title && <h1 style={{ ...TYPE_STYLE.heading, fontSize: 20, margin: "0 0 14px" }}>{title}</h1>}
        {blocks.length === 0 && !title && (
          <div style={{ fontSize: 13, color: C.t4, fontStyle: "italic", padding: "8px 0" }}>
            Start writing to see preview…
          </div>
        )}
        {blocks.map(b => {
          if (b.type === "heading") return <h2 key={b.id} style={{ ...TYPE_STYLE.heading, fontSize: 20, margin: "16px 0 8px" }} dangerouslySetInnerHTML={{ __html: b.html! }} />;
          if (b.type === "subheading") return <h3 key={b.id} style={{ ...TYPE_STYLE.subheading, margin: "14px 0 6px" }} dangerouslySetInnerHTML={{ __html: b.html! }} />;
          if (b.type === "body") return <p key={b.id} style={{ ...TYPE_STYLE.body, margin: "0 0 10px" }} dangerouslySetInnerHTML={{ __html: b.html! }} />;
          if (b.type === "quote") return <blockquote key={b.id} style={{ borderLeft: `3px solid ${C.accent}`, paddingLeft: 14, margin: "12px 0", ...TYPE_STYLE.body, fontStyle: "italic" }} dangerouslySetInnerHTML={{ __html: b.html! }} />;
          if (b.type === "list") return (
            <ul key={b.id} style={{ paddingLeft: 20, margin: "0 0 10px" }}>
              {(b.items ?? []).map((it, i) => <li key={i} style={{ ...TYPE_STYLE.body, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: it }} />)}
            </ul>
          );
          if (b.type === "image") return (
            <figure key={b.id} style={{ margin: "16px -16px" }}>
              {(b.uploadedUrl || b.localPreview)
                ? <img src={b.uploadedUrl || b.localPreview} alt={b.alt} style={{ width: "100%", display: "block", maxHeight: 380, objectFit: "cover" }} />
                : <div style={{ height: 140, background: C.surf, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: C.t3, fontSize: 12 }}>{b.status === "uploading" ? "Uploading…" : "Image pending"}</span>
                  </div>
              }
              {b.caption && <figcaption style={{ padding: "6px 16px", fontSize: 12, color: C.t3, fontStyle: "italic", textAlign: "center" }}>{b.caption}</figcaption>}
            </figure>
          );
          return null;
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REUSABLE SMALL COMPONENTS
══════════════════════════════════════════════════════════ */
function Toggle({ label, value, onChange, color = C.accent }:
  { label: string; value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      <div style={{ width: 42, height: 24, borderRadius: 12, position: "relative", flexShrink: 0,
        background: value ? color : C.input, transition: "background .2s",
        boxShadow: value ? `0 0 0 2px ${color}33` : "none" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18,
          borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 2px 6px rgba(0,0,0,.55)" }} />
      </div>
      <span style={{ fontSize: 14, color: C.t2, userSelect: "none", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: C.t3, fontWeight: 700, letterSpacing: 0.8,
    textTransform: "uppercase", marginBottom: 7 }}>{children}</div>;
}

function TInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ width: "100%", background: C.input, border: `1px solid ${focus ? C.bdrM : C.bdr}`,
        borderRadius: 12, padding: "12px 14px", color: C.t1, fontSize: 15,
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        colorScheme: "dark", transition: "border-color .15s", ...props.style }}
      {...props} />
  );
}

function Chip({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: "8px 16px", borderRadius: 30, border: "none", cursor: "pointer",
        fontSize: 13, fontWeight: 600, transition: "all .15s", whiteSpace: "nowrap",
        background: active ? `${color}22` : C.input, color: active ? color : C.t2,
        outline: active ? `1.5px solid ${color}55` : "1.5px solid transparent" }}>
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CreateFeedPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── type ── */
  const [feedType, setFeedType]   = useState("post");
  const ct = useMemo(() => FEED_TYPES.find(t => t.id === feedType)!, [feedType]);

  /* ── post/unified fields ── */
  const editorRef = useRef<HTMLDivElement>(null);
  const [postLabel, setPostLabel]   = useState<string>("Post");
  const [title, setTitle]           = useState("");
  const [tab, setTab]               = useState<"write"|"preview">("write");
  const [uploadCount, setUploadCount] = useState(0);

  /* ── event ── */
  const [eDate, setEDate]     = useState("");
  const [eTime, setETime]     = useState("");
  const [eEndDate,setEEndDate]= useState("");
  const [eEndTime,setEEndTime]= useState("");
  const [eLoc, setELoc]       = useState("");
  const [eFmt, setEFmt]       = useState<"in-person"|"virtual"|"hybrid">("in-person");
  const [rsvp, setRsvp]       = useState(true);
  const [maxAtt,setMaxAtt]    = useState("");
  const [eDesc, setEDesc]     = useState("");

  /* ── poll ── */
  const [pollQ, setPollQ]         = useState("");
  const [pollOpts, setPollOpts]   = useState([{id:uid(),text:""},{id:uid(),text:""}]);
  const [pollMulti,setPollMulti]  = useState(false);
  const [pollDur, setPollDur]     = useState("24");
  const [pollAnon,setPollAnon]    = useState(false);

  /* ── form ── */
  type QType = "short" | "long" | "single" | "multi" | "rating" | "date";
  type FormQ = { id: string; label: string; type: QType; required: boolean; options: string[] };
  const newQ = (): FormQ => ({ id: uid(), label: "", type: "short", required: false, options: ["",""] });
  const [formTitle, setFormTitle]     = useState("");
  const [formDesc,  setFormDesc]      = useState("");
  const [formQs,    setFormQs]        = useState<FormQ[]>([newQ()]);
  const [activeQId, setActiveQId]     = useState("");
  const addQ     = () => { const q = newQ(); setFormQs(p=>[...p,q]); setActiveQId(q.id); };
  const removeQ  = (id:string) => setFormQs(p => p.length>1 ? p.filter(q=>q.id!==id) : p);
  const updateQ  = (id:string, patch: Partial<FormQ>) => setFormQs(p=>p.map(q=>q.id===id?{...q,...patch}:q));
  const addQOpt  = (id:string) => updateQ(id, { options: [...(formQs.find(q=>q.id===id)?.options??[]),""] });
  const rmQOpt   = (id:string, i:number) => { const q=formQs.find(x=>x.id===id); if(!q||q.options.length<=2) return; const opts=[...q.options]; opts.splice(i,1); updateQ(id,{options:opts}); };
  const upQOpt   = (id:string, i:number, val:string) => { const q=formQs.find(x=>x.id===id); if(!q) return; const opts=[...q.options]; opts[i]=val; updateQ(id,{options:opts}); };
  const moveQ    = (id:string, dir:-1|1) => { const idx=formQs.findIndex(q=>q.id===id); if(idx<0) return; const arr=[...formQs]; const swap=idx+dir; if(swap<0||swap>=arr.length) return; [arr[idx],arr[swap]]=[arr[swap],arr[idx]]; setFormQs(arr); };
  const Q_TYPES: {id:QType;label:string}[] = [
    {id:"short",  label:"Short text"},
    {id:"long",   label:"Paragraph"},
    {id:"single", label:"Single choice"},
    {id:"multi",  label:"Multi-select"},
    {id:"rating", label:"Rating scale"},
    {id:"date",   label:"Date"},
  ];

  /* ── schedule ── */
  const [schedOn,  setSchedOn]    = useState(false);
  const [schedDate,setSchedDate]  = useState("");
  const [schedTime,setSchedTime]  = useState("");
  const [schedOpen,setSchedOpen]  = useState(false);

  /* ── ui ── */
  const [publishing, setPublishing] = useState(false);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (schedOn && !schedDate) {
      const d = new Date(); d.setHours(d.getHours()+1,0,0,0);
      setSchedDate(d.toISOString().split("T")[0]);
      setSchedTime(`${String(d.getHours()).padStart(2,"0")}:00`);
    }
  }, [schedOn]);

  /* ── image upload ── */
  const uploadImage = useCallback(async (file: File, imgEl: HTMLImageElement) => {
    setUploadCount(n => n + 1);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${API}/api/media/upload`, {
        method:"POST", body:fd, headers:{Authorization:`Bearer ${getToken()}`}
      });
      const data = await res.json();
      const cdnUrl = data?.url || data?.data?.url || "";
      if (cdnUrl) { imgEl.src = cdnUrl; imgEl.removeAttribute("data-uploading"); imgEl.style.opacity = "1"; }
    } catch { imgEl.style.opacity = ".35"; }
    finally { setUploadCount(n => Math.max(0, n - 1)); }
  }, []);

  const insertImageFile = useCallback((file: File) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.setAttribute("data-uploading","1");
    img.style.cssText = "max-width:100%;border-radius:10px;display:block;margin:8px 0;opacity:.6;transition:opacity .3s";
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0); range.collapse(false);
      range.insertNode(img); range.setStartAfter(img); range.collapse(true);
      sel.removeAllRanges(); sel.addRange(range);
    } else { editorRef.current?.appendChild(img); }
    uploadImage(file, img);
  }, [uploadImage]);

  /* ── paste ── */
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items ?? []);
    const imgItem = items.find(it => it.type.startsWith("image/"));
    if (imgItem) {
      e.preventDefault();
      const file = imgItem.getAsFile(); if (file) insertImageFile(file); return;
    }
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      document.execCommand("insertHTML", false, html);
      editorRef.current?.querySelectorAll("img[src^='data:']").forEach(el => {
        const img = el as HTMLImageElement;
        fetch(img.src).then(r=>r.blob()).then(blob => {
          img.setAttribute("data-uploading","1"); img.style.opacity=".6";
          uploadImage(new File([blob],"pasted.png",{type:blob.type}), img);
        }).catch(()=>{});
      }); return;
    }
    /* plain text — browser default */
  }, [insertImageFile, uploadImage]);

  /* ── file drop ── */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith("image/")).forEach(insertImageFile);
  }, [insertImageFile]);

  /* ── poll ops ── */
  const addOpt  = () => setPollOpts(p => p.length<6 ? [...p,{id:uid(),text:""}] : p);
  const rmOpt   = (id:string) => setPollOpts(p => p.length>2 ? p.filter(o=>o.id!==id) : p);
  const upOpt   = (id:string,text:string) => setPollOpts(p => p.map(o => o.id===id?{...o,text}:o));

  /* ── can publish ── */
  const canPublish = useMemo(() => {
    if (feedType==="post") return (editorRef.current?.innerText?.trim().length ?? 0) > 0 || title.trim().length > 0;
    if (feedType==="event") return title.trim().length > 0 && !!eDate && !!eTime;
    if (feedType==="poll") return pollQ.trim().length > 0 && pollOpts.filter(o=>o.text.trim()).length >= 2;
    if (feedType==="form") return formTitle.trim().length > 0 && formQs.some(q=>q.label.trim().length>0);
    return false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType, title, eDate, eTime, pollQ, pollOpts, formTitle, formQs, uploadCount]);

  /* ── build payload ── */
  const buildPayload = (status: string) => {
    const base: any = { type: feedType, postLabel, status };
    if (schedOn && schedDate && status !== "draft") {
      base.scheduledAt = new Date(`${schedDate}T${schedTime||"09:00"}`).toISOString();
      base.status = "scheduled";
    }
    if (feedType === "post") {
      base.title = title;
      base.html  = editorRef.current?.innerHTML ?? "";
    }
    if (feedType === "event") {
      base.title = title; base.description = eDesc;
      base.eventDate = new Date(`${eDate}T${eTime}`).toISOString();
      if (eEndDate) base.eventEndDate = new Date(`${eEndDate}T${eEndTime||"23:59"}`).toISOString();
      base.location = eLoc; base.format = eFmt;
      base.rsvpEnabled = rsvp; if (maxAtt) base.maxAttendees = parseInt(maxAtt);
    }
    if (feedType === "poll") {
      base.question = pollQ;
      base.options = pollOpts.filter(o=>o.text.trim()).map(o=>o.text.trim());
      base.allowMultiple = pollMulti; base.durationHours = parseInt(pollDur); base.anonymous = pollAnon;
    }
    if (feedType === "form") {
      base.title = formTitle; base.description = formDesc;
      base.questions = formQs.filter(q=>q.label.trim()).map(q=>({
        label: q.label.trim(), type: q.type, required: q.required,
        options: ["single","multi"].includes(q.type) ? q.options.filter(Boolean) : undefined,
      }));
    }
    return base;
  };

  const submit = async (status: string, setter: (v:boolean)=>void) => {
    setter(true);
    try {
      await fetch(`${API}/api/posts`, {
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${getToken()}`},
        body: JSON.stringify(buildPayload(status)),
      });
      router.push("/feeds");
    } catch { setter(false); }
  };

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:"100dvh", background:C.bg, color:C.t1,
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif" }}>

      {/* ══ NAV ═══════════════════════════════════════ */}
      <div style={{
        position:"sticky", top:0, zIndex:60,
        background:"rgba(15,15,17,0.88)", backdropFilter:"blur(28px) saturate(180%)",
        borderBottom:`1px solid ${C.bdr}`,
        display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
      }}>
        <button onClick={() => router.back()}
          style={{ width:34, height:34, borderRadius:"50%", background:C.surf, border:"none",
            color:C.t2, fontSize:22, display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", flexShrink:0, lineHeight:1 }}>‹</button>

        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:17, fontWeight:600, color:C.t1, letterSpacing:-.3 }}>Create</p>
          <p style={{ margin:0, fontSize:11, color:C.t3, marginTop:1 }}>
            {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
            {schedOn && schedDate && <span style={{color:C.accent}}> · sched {schedDate}</span>}
          </p>
        </div>

        {/* write / preview — all types */}
        <div style={{ display:"flex", background:C.surf, borderRadius:8, padding:2, gap:1 }}>
          {(["write","preview"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:"5px 13px", borderRadius:7, border:"none",
                cursor:"pointer", fontSize:12, fontWeight:500,
                background: tab===t ? C.card : "none",
                color: tab===t ? C.t1 : C.t3,
                transition:"all .12s", letterSpacing:"-.1px" }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TYPE TABS ══════════════════════════════════ */}
      <div style={{ background:C.bg, borderBottom:`1px solid ${C.bdr}`,
        overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"none" }}>
        <div style={{ display:"flex", gap:8, padding:"10px 16px", width:"max-content" }}>
          {FEED_TYPES.map(t => {
            const active = t.id === feedType;
            return (
              <button key={t.id} onClick={() => { setFeedType(t.id); setTab("write"); }}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"6px 14px", borderRadius:20,
                  border: active ? "none" : `1px solid ${C.bdr}`,
                  background: active ? t.color+"26" : "none",
                  color: active ? t.color : C.t3,
                  fontSize:13, fontWeight: active ? 600 : 400,
                  cursor:"pointer", transition:"all .15s", letterSpacing:"-.1px",
                  outline: active ? `1px solid ${t.color}44` : "none",
                }}>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ BODY ═══════════════════════════════════════ */}
      <div style={{ maxWidth:640, margin:"0 auto", padding:"20px 16px 160px" }}>

        {/* ── POST / UNIFIED ───────────────────────────── */}
        {feedType==="post" && (
          <AnimatePresence mode="wait">
            {tab==="write" ? (
              <motion.div key="write" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>

                {/* title */}
                <div style={{ marginBottom:16 }}>
                  <input type="text" placeholder="Title (optional)" value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={{ width:"100%", background:"none", border:"none", borderBottom:`1px solid ${C.bdr}`,
                      padding:"0 0 14px", color:C.t1, fontSize:20, fontWeight:600, outline:"none",
                      fontFamily:"inherit", letterSpacing:"-.3px", caretColor:C.accent }}
                    onFocus={e => e.currentTarget.style.borderBottomColor=C.bdrM}
                    onBlur={e => e.currentTarget.style.borderBottomColor=C.bdr} />
                </div>

                {/* upload progress indicator */}
                {uploadCount > 0 && (
                  <div style={{ marginBottom:10, padding:"8px 13px", borderRadius:10,
                    background:C.card, border:`1px solid ${C.bdr}`,
                    display:"flex", alignItems:"center", gap:8, fontSize:12, color:C.t2 }}>
                    <motion.span animate={{rotate:360}} transition={{duration:.9,repeat:Infinity,ease:"linear"}} style={{display:"inline-block"}}>↻</motion.span>
                    Uploading {uploadCount} image{uploadCount>1?"s":""}…
                  </div>
                )}

                {/* rich text editor */}
                <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()}
                  style={{ background:C.card, borderRadius:14, border:`1px solid ${C.bdr}`, overflow:"hidden", marginBottom:14 }}>
                  <RichToolbar editorRef={editorRef} fileRef={fileRef} insertImageFile={insertImageFile} />
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onPaste={handlePaste}
                    data-placeholder="Write something, paste an article, or drop images here…"
                    style={{ minHeight:240, padding:"14px 16px", color:C.t1, fontSize:15,
                      lineHeight:1.7, outline:"none", fontFamily:"inherit",
                      wordBreak:"break-word",
                    }}
                  />
                </div>

                {/* hidden file input */}
                <input ref={fileRef} type="file" multiple accept="image/*" style={{display:"none"}}
                  onChange={e => { Array.from(e.target.files??[]).forEach(insertImageFile); e.target.value=""; }} />
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>
                <div style={{ fontSize:11, fontWeight:600, color:C.t3, letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>Preview</div>
                {title && <h2 style={{ margin:"0 0 12px", fontSize:22, fontWeight:700, color:C.t1, letterSpacing:"-.4px" }}>{title}</h2>}
                <div
                  dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML ?? "<p style=\"color:#636366\">Nothing to preview yet.</p>" }}
                  style={{ fontSize:15, lineHeight:1.7, color:C.t1 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── EVENT ──────────────────────────────────── */}
        {feedType==="event" && (
          <AnimatePresence mode="wait">
          {tab==="write" ? (
          <motion.div key="write" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>
            <div style={{ marginBottom:16 }}>
              <input type="text" placeholder="Event name…" value={title} onChange={e=>setTitle(e.target.value)}
                style={{ width:"100%", background:"none", border:"none", borderBottom:`1px solid ${C.bdr}`,
                  padding:"0 0 12px", color:C.t1, fontSize:24, fontWeight:700, outline:"none",
                  fontFamily:"inherit", letterSpacing:"-.5px", caretColor:ct.color }}
                onFocus={e=>e.currentTarget.style.borderBottomColor=ct.color}
                onBlur={e=>e.currentTarget.style.borderBottomColor=C.bdr} />
            </div>

            {/* format */}
            <div style={{ marginBottom:18 }}>
              <SLabel>Format</SLabel>
              <div style={{ display:"flex", gap:8 }}>
                {(["in-person","virtual","hybrid"] as const).map(f => (
                  <Chip key={f} active={eFmt===f} color={ct.color} onClick={()=>setEFmt(f)}
                    label={f==="in-person"?"📍 In-Person":f==="virtual"?"💻 Virtual":"🌐 Hybrid"} />
                ))}
              </div>
            </div>

            {/* dates */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
              <div><SLabel>Start date</SLabel><TInput type="date" value={eDate} onChange={e=>setEDate(e.target.value)} style={{padding:"11px 12px"}} /></div>
              <div><SLabel>Start time</SLabel><TInput type="time" value={eTime} onChange={e=>setETime(e.target.value)} style={{padding:"11px 12px"}} /></div>
              <div><SLabel>End date <span style={{color:C.t4,fontWeight:400,textTransform:"none",letterSpacing:0}}>opt.</span></SLabel><TInput type="date" value={eEndDate} onChange={e=>setEEndDate(e.target.value)} style={{padding:"11px 12px"}} /></div>
              <div><SLabel>End time</SLabel><TInput type="time" value={eEndTime} onChange={e=>setEEndTime(e.target.value)} style={{padding:"11px 12px"}} /></div>
            </div>

            {/* location */}
            <div style={{ marginBottom:18 }}>
              <SLabel>Location</SLabel>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>📍</span>
                <TInput type="text" placeholder="Venue, city or meeting link…" value={eLoc} onChange={e=>setELoc(e.target.value)} style={{paddingLeft:40}} />
              </div>
            </div>

            {/* description */}
            <div style={{ marginBottom:18 }}>
              <SLabel>Description <span style={{color:C.t4,fontWeight:400,textTransform:"none",letterSpacing:0}}>optional</span></SLabel>
              <textarea value={eDesc} onChange={e=>setEDesc(e.target.value)} placeholder="Tell people what to expect…" rows={4}
                style={{ width:"100%", background:C.input, border:`1px solid ${C.bdr}`, borderRadius:12,
                  padding:"12px 14px", color:C.t1, fontSize:15, lineHeight:1.65, outline:"none",
                  resize:"vertical", boxSizing:"border-box", fontFamily:"inherit", colorScheme:"dark" }}
                onFocus={e=>e.currentTarget.style.borderColor=C.bdrM}
                onBlur={e=>e.currentTarget.style.borderColor=C.bdr} />
            </div>

            {/* rsvp */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:6 }}>
              <Toggle label="Enable RSVP" value={rsvp} onChange={setRsvp} color={ct.color} />
              {rsvp && <TInput type="number" placeholder="Max attendees (opt.)" value={maxAtt} onChange={e=>setMaxAtt(e.target.value)} style={{flex:1,padding:"10px 12px"}} />}
            </div>
          </motion.div>
          ) : (
          <motion.div key="preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>
            <div style={{ fontSize:11, fontWeight:600, color:C.t3, letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>Preview</div>
            <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.bdr}`, padding:"18px 18px 14px" }}>
              {title ? <h2 style={{ margin:"0 0 10px", fontSize:20, fontWeight:700, color:C.t1, letterSpacing:"-.4px" }}>{title}</h2>
                : <p style={{ margin:"0 0 10px", fontSize:16, color:C.t3 }}>No event name yet</p>}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                {eDate && <span style={{ fontSize:12, color:C.t2, background:C.surf, borderRadius:6, padding:"4px 10px" }}>{eDate}{eTime ? " · "+eTime : ""}</span>}
                {eLoc && <span style={{ fontSize:12, color:C.t2, background:C.surf, borderRadius:6, padding:"4px 10px" }}>📍 {eLoc}</span>}
                <span style={{ fontSize:12, color:C.t2, background:C.surf, borderRadius:6, padding:"4px 10px", textTransform:"capitalize" }}>{eFmt}</span>
              </div>
              {eDesc && <p style={{ margin:0, fontSize:14, color:C.t2, lineHeight:1.65 }}>{eDesc}</p>}
            </div>
          </motion.div>
          )}
          </AnimatePresence>
        )}

        {/* ── FORM ──────────────────────────────────── */}
        {feedType==="form" && (
          <AnimatePresence mode="wait">
          {tab==="write" ? (
          <motion.div key="write" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>

            {/* ── header block ── */}
            <div style={{ marginBottom:28 }}>
              <input
                type="text" value={formTitle} onChange={e=>setFormTitle(e.target.value)}
                placeholder="Form title"
                style={{ display:"block", width:"100%", background:"none", border:"none",
                  borderBottom:`1px solid ${C.bdr}`, paddingBottom:10, marginBottom:10,
                  color:C.t1, fontSize:17, fontWeight:600, letterSpacing:"-.3px",
                  outline:"none", fontFamily:"inherit", caretColor:ct.color }}
                onFocus={e=>e.currentTarget.style.borderBottomColor=C.bdrM}
                onBlur={e=>e.currentTarget.style.borderBottomColor=C.bdr}
              />
              <input
                type="text" value={formDesc} onChange={e=>setFormDesc(e.target.value)}
                placeholder="Description — help respondents understand the purpose"
                style={{ display:"block", width:"100%", background:"none", border:"none",
                  paddingBottom:4, color:C.t3, fontSize:13, outline:"none",
                  fontFamily:"inherit", caretColor:ct.color }}
                onFocus={e=>e.currentTarget.style.color=C.t2}
                onBlur={e=>e.currentTarget.style.color=C.t3}
              />
            </div>

            {/* ── question list ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {formQs.map((q, qi) => {
                const isOpen = activeQId === q.id;
                const hasChoice = q.type==="single" || q.type==="multi";
                const typeLabel = Q_TYPES.find(t=>t.id===q.type)?.label ?? "";
                return (
                  <motion.div key={q.id} layout transition={{duration:.18,ease:[.22,1,.36,1]}}
                    style={{
                      borderRadius:14,
                      overflow:"hidden",
                      background: C.card,
                      border:`1px solid ${isOpen ? C.bdrM : C.bdr}`,
                      boxShadow: isOpen ? `0 0 0 3px ${ct.color}18` : "none",
                      transition:"border-color .15s, box-shadow .18s",
                    }}>

                    {/* row header */}
                    <button
                      onClick={()=>setActiveQId(isOpen ? "" : q.id)}
                      style={{ width:"100%", background:"none", border:"none",
                        padding:"14px 16px", display:"flex", alignItems:"center",
                        gap:12, cursor:"pointer", textAlign:"left" }}>
                      {/* index pill */}
                      <span style={{ width:20, height:20, borderRadius:5,
                        background: isOpen ? ct.color : C.surf,
                        color: isOpen ? "#fff" : C.t3,
                        fontSize:10, fontWeight:700, fontVariantNumeric:"tabular-nums",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexShrink:0, transition:"background .15s, color .15s" }}>
                        {qi+1}
                      </span>
                      {/* label */}
                      <span style={{ flex:1, fontSize:14, fontWeight:q.label.trim()?600:400,
                        color: q.label.trim() ? C.t1 : C.t3,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {q.label.trim() || "Question"}
                      </span>
                      {/* type badge */}
                      <span style={{ fontSize:11, color:C.t3, letterSpacing:.1,
                        background:C.surf, borderRadius:5, padding:"3px 8px",
                        fontWeight:500, whiteSpace:"nowrap", flexShrink:0 }}>
                        {typeLabel}
                      </span>
                      {/* chevron */}
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke={C.t3} strokeWidth="2" strokeLinecap="round"
                        style={{ flexShrink:0, transition:"transform .18s",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* expanded editor */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                          exit={{height:0,opacity:0}} transition={{duration:.18,ease:[.22,1,.36,1]}}
                          style={{ overflow:"hidden" }}>
                          <div style={{ borderTop:`1px solid ${C.bdr}`, padding:"16px" }}>

                            {/* question text input */}
                            <div style={{ marginBottom:14 }}>
                              <div style={{ fontSize:11, fontWeight:600, color:C.t3,
                                letterSpacing:.6, textTransform:"uppercase", marginBottom:6 }}>Question</div>
                              <input
                                type="text" placeholder="Enter your question here…" value={q.label}
                                onChange={e=>updateQ(q.id,{label:e.target.value})}
                                style={{ width:"100%", background:C.input, border:`1px solid ${C.bdr}`,
                                  borderRadius:10, padding:"10px 13px", color:C.t1, fontSize:14,
                                  fontWeight:500, outline:"none", fontFamily:"inherit",
                                  transition:"border-color .12s" }}
                                onFocus={e=>e.currentTarget.style.borderColor=C.bdrM}
                                onBlur={e=>e.currentTarget.style.borderColor=C.bdr}
                              />
                            </div>

                            {/* response type */}
                            <div style={{ marginBottom:16 }}>
                              <div style={{ fontSize:11, fontWeight:600, color:C.t3,
                                letterSpacing:.6, textTransform:"uppercase", marginBottom:8 }}>Response type</div>
                              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                {Q_TYPES.map(t => (
                                  <button key={t.id} onClick={()=>updateQ(q.id,{type:t.id})}
                                    style={{ padding:"6px 13px", borderRadius:8, border:"none",
                                      cursor:"pointer", fontSize:12, fontWeight:500,
                                      letterSpacing:"-.1px", transition:"all .12s",
                                      background: q.type===t.id ? ct.color : C.surf,
                                      color: q.type===t.id ? "#fff" : C.t2 }}>
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* choices — single / multi */}
                            {hasChoice && (
                              <div style={{ marginBottom:16 }}>
                                <div style={{ fontSize:11, fontWeight:600, color:C.t3,
                                  letterSpacing:.6, textTransform:"uppercase", marginBottom:8 }}>Choices</div>
                                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                  {q.options.map((opt,oi) => (
                                    <div key={oi} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                      {/* indicator */}
                                      <div style={{ width:16, height:16, flexShrink:0,
                                        borderRadius: q.type==="multi" ? 4 : "50%",
                                        border:`1.5px solid ${C.t3}` }} />
                                      <input
                                        type="text" placeholder={`Option ${oi+1}`} value={opt}
                                        onChange={e=>upQOpt(q.id,oi,e.target.value)}
                                        style={{ flex:1, background:"none", border:"none",
                                          borderBottom:`1px solid ${C.bdr}`, paddingBottom:7,
                                          color:C.t1, fontSize:13, outline:"none",
                                          fontFamily:"inherit", transition:"border-color .12s" }}
                                        onFocus={e=>e.currentTarget.style.borderBottomColor=C.bdrM}
                                        onBlur={e=>e.currentTarget.style.borderBottomColor=C.bdr}
                                      />
                                      {q.options.length>2 && (
                                        <button onClick={()=>rmQOpt(q.id,oi)}
                                          style={{ background:"none", border:"none",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            cursor:"pointer", padding:2, opacity:.5,
                                            color:C.t2 }}>
                                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {q.options.length<6 && (
                                    <button onClick={()=>addQOpt(q.id)}
                                      style={{ alignSelf:"flex-start", marginTop:4,
                                        background:"none", border:"none", cursor:"pointer",
                                        fontSize:12, fontWeight:600, color:ct.color,
                                        padding:0, letterSpacing:"-.1px" }}>
                                      + Add option
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* rating scale preview */}
                            {q.type==="rating" && (
                              <div style={{ marginBottom:16 }}>
                                <div style={{ fontSize:11, fontWeight:600, color:C.t3,
                                  letterSpacing:.6, textTransform:"uppercase", marginBottom:8 }}>Scale preview</div>
                                <div style={{ display:"flex", gap:6 }}>
                                  {[1,2,3,4,5].map(n=>(
                                    <div key={n} style={{ flex:1, paddingTop:"100%", position:"relative",
                                      borderRadius:8, background:C.surf, border:`1px solid ${C.bdr}` }}>
                                      <span style={{ position:"absolute", inset:0, display:"flex",
                                        alignItems:"center", justifyContent:"center",
                                        fontSize:13, fontWeight:600, color:C.t3,
                                        fontVariantNumeric:"tabular-nums" }}>{n}</span>
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display:"flex", justifyContent:"space-between",
                                  marginTop:6, fontSize:10, color:C.t3 }}>
                                  <span>Not at all</span><span>Extremely</span>
                                </div>
                              </div>
                            )}

                            {/* date preview */}
                            {q.type==="date" && (
                              <div style={{ marginBottom:16, background:C.surf, borderRadius:10,
                                border:`1px solid ${C.bdr}`, padding:"10px 13px",
                                fontSize:13, color:C.t3 }}>
                                Respondents will see a date picker
                              </div>
                            )}

                            {/* footer: required + actions */}
                            <div style={{ display:"flex", alignItems:"center", gap:8,
                              paddingTop:12, borderTop:`1px solid ${C.bdr}` }}>

                              {/* required toggle */}
                              <button onClick={()=>updateQ(q.id,{required:!q.required})}
                                style={{ display:"flex", alignItems:"center", gap:7,
                                  background:"none", border:"none", cursor:"pointer", padding:0 }}>
                                <div style={{ width:30, height:17, borderRadius:99, position:"relative",
                                  background: q.required ? ct.color : C.surf,
                                  border:`1px solid ${q.required ? ct.color : C.bdrM}`,
                                  transition:"background .15s", flexShrink:0 }}>
                                  <div style={{ position:"absolute", top:2,
                                    left: q.required ? 14 : 2, width:11, height:11,
                                    borderRadius:"50%", background:"#fff",
                                    boxShadow:"0 1px 3px rgba(0,0,0,.4)",
                                    transition:"left .15s" }} />
                                </div>
                                <span style={{ fontSize:12, color: q.required ? C.t1 : C.t3,
                                  fontWeight:500, letterSpacing:"-.1px",
                                  transition:"color .15s" }}>Required</span>
                              </button>

                              <div style={{ flex:1 }} />

                              {/* move up */}
                              <button onClick={()=>moveQ(q.id,-1)} disabled={qi===0}
                                style={{ background:"none", border:"none", cursor:qi===0?"default":"pointer",
                                  opacity:qi===0?.25:1, padding:"4px", display:"flex",
                                  alignItems:"center", color:C.t2, transition:"opacity .12s" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <polyline points="18 15 12 9 6 15"/>
                                </svg>
                              </button>

                              {/* move down */}
                              <button onClick={()=>moveQ(q.id,1)} disabled={qi===formQs.length-1}
                                style={{ background:"none", border:"none", cursor:qi===formQs.length-1?"default":"pointer",
                                  opacity:qi===formQs.length-1?.25:1, padding:"4px", display:"flex",
                                  alignItems:"center", color:C.t2, transition:"opacity .12s" }}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <polyline points="6 9 12 15 18 9"/>
                                </svg>
                              </button>

                              {/* delete */}
                              <button onClick={()=>{removeQ(q.id); if(activeQId===q.id) setActiveQId("");}}
                                style={{ background:"none", border:"none", cursor:"pointer",
                                  padding:"4px", display:"flex", alignItems:"center",
                                  color:C.t3, opacity:.7, transition:"opacity .12s" }}
                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity=".7"}>
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                  stroke={C.red} strokeWidth="1.8" strokeLinecap="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14H6L5 6"/>
                                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                                </svg>
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* add question */}
            <button onClick={addQ}
              style={{ display:"flex", alignItems:"center", justifyContent:"center",
                gap:8, width:"100%", marginTop:10, padding:"13px 0",
                background:"none", border:`1px solid ${C.bdr}`, borderRadius:12,
                color:C.t2, fontSize:13, fontWeight:500, cursor:"pointer",
                letterSpacing:"-.1px", transition:"border-color .12s, color .12s" }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.bdrM; (e.currentTarget as HTMLElement).style.color=C.t1; }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor=C.bdr; (e.currentTarget as HTMLElement).style.color=C.t2; }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add question
            </button>

            <p style={{ marginTop:16, fontSize:11, color:C.t3, textAlign:"center",
              letterSpacing:.1, lineHeight:1.7 }}>
              Respondents submit answers directly from their feed.
            </p>
          </motion.div>
          ) : (
          <motion.div key="preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>
            <div style={{ fontSize:11, fontWeight:600, color:C.t3, letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>Preview</div>
            <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.bdr}`, padding:"18px 18px 14px" }}>
              {formTitle ? <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:700, color:C.t1, letterSpacing:"-.3px" }}>{formTitle}</h2>
                : <p style={{ margin:"0 0 6px", fontSize:16, color:C.t3 }}>No title yet</p>}
              {formDesc && <p style={{ margin:"0 0 14px", fontSize:13, color:C.t3, lineHeight:1.5 }}>{formDesc}</p>}
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {formQs.filter(q=>q.label.trim()).map((q,i) => (
                  <div key={q.id} style={{ background:C.surf, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.t1, marginBottom:4 }}>{i+1}. {q.label}</div>
                    <div style={{ fontSize:11, color:C.t3, textTransform:"capitalize" }}>{Q_TYPES.find(t=>t.id===q.type)?.label}</div>
                  </div>
                ))}
                {formQs.filter(q=>q.label.trim()).length===0 && <p style={{ margin:0, fontSize:13, color:C.t3 }}>No questions yet</p>}
              </div>
            </div>
          </motion.div>
          )}
          </AnimatePresence>
        )}

        {/* ── POLL ───────────────────────────────────── */}
        {feedType==="poll" && (
          <AnimatePresence mode="wait">
          {tab==="write" ? (
          <motion.div key="write" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>

            {/* question */}
            <div style={{ marginBottom:28 }}>
              <input
                type="text" value={pollQ} onChange={e=>setPollQ(e.target.value)}
                placeholder="Ask your question"
                style={{ display:"block", width:"100%", background:"none", border:"none",
                  borderBottom:`1px solid ${C.bdr}`, paddingBottom:10,
                  color:C.t1, fontSize:17, fontWeight:600, letterSpacing:"-.3px",
                  outline:"none", fontFamily:"inherit", caretColor:ct.color }}
                onFocus={e=>e.currentTarget.style.borderBottomColor=C.bdrM}
                onBlur={e=>e.currentTarget.style.borderBottomColor=C.bdr}
              />
            </div>

            {/* options */}
            <div style={{ fontSize:11, fontWeight:600, color:C.t3,
              letterSpacing:.6, textTransform:"uppercase", marginBottom:10 }}>Options</div>
            <div style={{ display:"flex", flexDirection:"column", gap:0,
              background:C.card, borderRadius:12, border:`1px solid ${C.bdr}`,
              overflow:"hidden", marginBottom:20 }}>
              {pollOpts.map((opt,i) => (
                <div key={opt.id} style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"0 14px",
                  borderBottom: i < pollOpts.length-1 ? `1px solid ${C.bdr}` : "none" }}>
                  <span style={{ fontSize:11, fontWeight:600, color:C.t3,
                    fontVariantNumeric:"tabular-nums", width:14, flexShrink:0 }}>{i+1}</span>
                  <input
                    type="text" placeholder={`Option ${i+1}`} value={opt.text}
                    onChange={e=>upOpt(opt.id,e.target.value)}
                    style={{ flex:1, background:"none", border:"none", padding:"13px 0",
                      color:C.t1, fontSize:14, outline:"none", fontFamily:"inherit" }}
                  />
                  {pollOpts.length>2 && (
                    <button onClick={()=>rmOpt(opt.id)}
                      style={{ background:"none", border:"none", cursor:"pointer",
                        padding:4, display:"flex", alignItems:"center",
                        color:C.t3, opacity:.6,
                        transition:"opacity .12s" }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity=".6"}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {pollOpts.length<6 && (
              <button onClick={addOpt}
                style={{ display:"flex", alignItems:"center", gap:7, marginBottom:24,
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:13, fontWeight:500, color:C.t2, padding:0,
                  letterSpacing:"-.1px" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=C.t1}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=C.t2}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add option
              </button>
            )}

            {/* settings row */}
            <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.bdr}`,
              overflow:"hidden" }}>
              {/* multiple */}
              <div style={{ display:"flex", alignItems:"center", padding:"13px 16px",
                borderBottom:`1px solid ${C.bdr}` }}>
                <span style={{ flex:1, fontSize:14, color:C.t1, fontWeight:400 }}>Multiple answers</span>
                <div style={{ width:36, height:20, borderRadius:99, position:"relative",
                  background: pollMulti ? ct.color : C.surf,
                  border:`1px solid ${pollMulti ? ct.color : C.bdrM}`,
                  cursor:"pointer", transition:"background .15s", flexShrink:0 }}
                  onClick={()=>setPollMulti(v=>!v)}>
                  <div style={{ position:"absolute", top:2.5,
                    left: pollMulti ? 17 : 2.5, width:13, height:13,
                    borderRadius:"50%", background:"#fff",
                    boxShadow:"0 1px 3px rgba(0,0,0,.4)",
                    transition:"left .15s" }} />
                </div>
              </div>
              {/* anonymous */}
              <div style={{ display:"flex", alignItems:"center", padding:"13px 16px",
                borderBottom:`1px solid ${C.bdr}` }}>
                <span style={{ flex:1, fontSize:14, color:C.t1, fontWeight:400 }}>Anonymous responses</span>
                <div style={{ width:36, height:20, borderRadius:99, position:"relative",
                  background: pollAnon ? ct.color : C.surf,
                  border:`1px solid ${pollAnon ? ct.color : C.bdrM}`,
                  cursor:"pointer", transition:"background .15s", flexShrink:0 }}
                  onClick={()=>setPollAnon(v=>!v)}>
                  <div style={{ position:"absolute", top:2.5,
                    left: pollAnon ? 17 : 2.5, width:13, height:13,
                    borderRadius:"50%", background:"#fff",
                    boxShadow:"0 1px 3px rgba(0,0,0,.4)",
                    transition:"left .15s" }} />
                </div>
              </div>
              {/* duration */}
              <div style={{ display:"flex", alignItems:"center", padding:"12px 16px" }}>
                <span style={{ flex:1, fontSize:14, color:C.t1, fontWeight:400 }}>Duration</span>
                <select value={pollDur} onChange={e=>setPollDur(e.target.value)}
                  style={{ background:"none", border:"none", color:C.t2,
                    fontSize:13, outline:"none", cursor:"pointer",
                    fontFamily:"inherit" }}>
                  {["1","6","12","24","48","72","168"].map(h => (
                    <option key={h} value={h} style={{background:C.card}}>{h==="168"?"7 days":`${h}h`}</option>
                  ))}
                </select>
              </div>
            </div>

          </motion.div>
          ) : (
          <motion.div key="preview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}>
            <div style={{ fontSize:11, fontWeight:600, color:C.t3, letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>Preview</div>
            <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.bdr}`, padding:"18px 18px 14px" }}>
              {pollQ ? <h2 style={{ margin:"0 0 16px", fontSize:17, fontWeight:600, color:C.t1, letterSpacing:"-.2px", lineHeight:1.4 }}>{pollQ}</h2>
                : <p style={{ margin:"0 0 16px", fontSize:16, color:C.t3 }}>No question yet</p>}
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {pollOpts.filter(o=>o.text.trim()).map((o,i) => (
                  <div key={o.id} style={{ background:C.surf, borderRadius:10, padding:"11px 14px",
                    display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:16, height:16, borderRadius: pollMulti?4:"50%",
                      border:`2px solid ${ct.color}`, flexShrink:0 }} />
                    <span style={{ fontSize:14, color:C.t1 }}>{o.text}</span>
                  </div>
                ))}
                {pollOpts.filter(o=>o.text.trim()).length===0 && <p style={{ margin:0, fontSize:13, color:C.t3 }}>No options yet</p>}
              </div>
              <div style={{ marginTop:12, fontSize:11, color:C.t3 }}>
                {pollDur==="168" ? "7 days" : `${pollDur}h`} · {pollMulti?"Multiple answers":"Single answer"}{pollAnon?" · Anonymous":""}
              </div>
            </div>
          </motion.div>
          )}
          </AnimatePresence>
        )}

        {/* ══ SCHEDULE PANEL ═══════════════════════════ */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.bdr}`, overflow:"hidden", marginBottom:16, marginTop:8 }}>
          <button onClick={()=>setSchedOpen(s=>!s)}
            style={{ width:"100%", background:"none", border:"none", padding:"14px 16px",
              display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`${C.accent}18`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🗓</div>
            <div style={{ flex:1, textAlign:"left" }}>
              <p style={{ margin:0, fontSize:14, fontWeight:600, color:C.t1 }}>
                {schedOn && schedDate ? `Scheduled · ${schedDate} · ${schedTime||"09:00"}` : "Schedule post"}
              </p>
              <p style={{ margin:"2px 0 0", fontSize:12, color:C.t3 }}>Publish at a future date & time</p>
            </div>
            {schedOn && <div style={{ width:7, height:7, borderRadius:"50%", background:C.accent, flexShrink:0 }} />}
            <span style={{ color:C.t3, fontSize:11, transform:schedOpen?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
          </button>
          <AnimatePresence>
            {schedOpen && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                exit={{height:0,opacity:0}} transition={{duration:.18}}
                style={{ overflow:"hidden", borderTop:`1px solid ${C.bdr}`, padding:"16px" }}>
                <Toggle label="Enable scheduling" value={schedOn} onChange={setSchedOn} color={C.accent} />
                {schedOn && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:14 }}>
                    <div><SLabel>Date</SLabel><TInput type="date" value={schedDate} min={new Date().toISOString().split("T")[0]} onChange={e=>setSchedDate(e.target.value)} style={{padding:"11px 12px"}} /></div>
                    <div><SLabel>Time</SLabel><TInput type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)} style={{padding:"11px 12px"}} /></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══ BOTTOM BAR ════════════════════════════════ */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:50,
        background:"rgba(15,15,17,0.96)", backdropFilter:"blur(28px) saturate(180%)",
        borderTop:`1px solid ${C.bdr}`,
        padding:`14px 16px calc(14px + env(safe-area-inset-bottom))`,
        display:"flex", gap:10,
      }}>
        <button onClick={() => submit("draft", setSaving)} disabled={saving}
          style={{ flex:1, background:C.surf, border:`1px solid ${C.bdr}`,
            color:C.t2, fontSize:15, fontWeight:600, padding:"14px 0",
            borderRadius:14, cursor:"pointer" }}>
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button onClick={() => submit("published", setPublishing)} disabled={!canPublish||publishing}
          style={{ flex:2, border:"none", color: canPublish ? "#fff" : C.t3,
            fontSize:15, fontWeight:700, padding:"14px 0", borderRadius:14,
            cursor: canPublish ? "pointer" : "not-allowed",
            opacity: publishing ? .75 : 1, transition:"all .25s",
            background: canPublish ? `linear-gradient(135deg, ${ct.color} 0%, ${ct.color}CC 100%)` : C.input,
            boxShadow: canPublish ? `0 8px 28px ${ct.color}44` : "none" }}>
          {publishing ? "Publishing…" : schedOn ? "Schedule" : "Publish"}
        </button>
      </div>

      {/* ══ GLOBAL STYLES ══════════════════════════════ */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .block-row:hover .brow-meta  { opacity: 1 !important; }
        .block-row:hover .brow-del   { opacity: 1 !important; }
        [contenteditable] b, [contenteditable] strong { font-weight: 700 !important; color: ${C.t1} !important; }
        [contenteditable] i, [contenteditable] em     { font-style: italic !important; }
        [contenteditable] u                           { text-decoration: underline; }
        [contenteditable] a                           { color: ${C.accent} !important; text-decoration: underline !important; text-underline-offset: 3px; }
        [contenteditable]:empty::before               { content: attr(data-placeholder); color: ${C.t4}; pointer-events: none; }
        [contenteditable] h2 { font-size:22px; font-weight:700; color:${C.t1}; margin:14px 0 6px; letter-spacing:-.4px; }
        [contenteditable] h3 { font-size:18px; font-weight:600; color:${C.t1}; margin:12px 0 4px; }
        [contenteditable] p  { margin:0 0 8px; }
        [contenteditable] ul, [contenteditable] ol { padding-left:22px; margin:6px 0 10px; }
        [contenteditable] li { margin-bottom:4px; }
        [contenteditable] blockquote { border-left:3px solid ${C.accent}; margin:10px 0; padding:4px 12px; color:${C.t2}; font-style:italic; }
        [contenteditable] img { max-width:100%; border-radius:10px; display:block; margin:8px 0; }
        input[type=date]::-webkit-calendar-picker-indicator,
        input[type=time]::-webkit-calendar-picker-indicator { filter: invert(.55); cursor: pointer; }
        select option { background: #1A1A1C; }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      `}</style>
    </div>
  );
}

