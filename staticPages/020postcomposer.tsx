import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   SIZE TOKEN SYSTEM
   Three levels only — mapped from source HTML.
   Raw px/pt/em values are NEVER passed through.
   ───────────────────────────────────────────── */
const SIZE_TOKENS = {
  large: {
    tag: "h2",
    style: {
      fontFamily: "Syne, -apple-system, sans-serif",
      fontSize: 22,
      fontWeight: 700,
      color: "#F2F2F7",
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
      margin: "10px 0 4px",
    },
    label: "Heading",
    shortcut: "H",
  },
  medium: {
    tag: "h3",
    style: {
      fontFamily: "Syne, -apple-system, sans-serif",
      fontSize: 17,
      fontWeight: 600,
      color: "#F2F2F7",
      letterSpacing: "-0.015em",
      lineHeight: 1.3,
      margin: "8px 0 4px",
    },
    label: "Subheading",
    shortcut: "S",
  },
  body: {
    tag: "p",
    style: {
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 15,
      fontWeight: 400,
      color: "#AEAEB2",
      letterSpacing: "-0.01em",
      lineHeight: 1.6,
      margin: "2px 0",
    },
    label: "Body",
    shortcut: "B",
  },
};

/* ─────────────────────────────────────────────
   PASTE SANITIZER — now maps size to tokens
   ───────────────────────────────────────────── */
const ALLOWED_INLINE = new Set(["b", "strong", "i", "em", "a"]);
const BLOCK_TAGS = new Set(["p", "div", "section", "article", "blockquote", "pre", "td", "li"]);
const LIST_TAGS = new Set(["ul", "ol"]);

/* Detect what size level a node was in its source doc */
function detectSizeLevel(node) {
  const tag = node.tagName?.toLowerCase();
  if (!tag) return null;

  // Semantic heading tags — clear intent
  if (tag === "h1" || tag === "h2") return "large";
  if (tag === "h3" || tag === "h4") return "medium";

  // Style-based detection for spans/divs with explicit sizes
  const style = node.getAttribute?.("style") || "";
  const sizeMatch = style.match(/font-size\s*:\s*([\d.]+)(pt|px|em|rem)/i);
  if (sizeMatch) {
    let px = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2].toLowerCase();
    // Normalise to px
    if (unit === "pt") px = px * 1.333;
    if (unit === "em" || unit === "rem") px = px * 16;
    if (px >= 22) return "large";
    if (px >= 17) return "medium";
  }

  return null; // body/default
}

/* Build a clean element mapped to our token system */
function buildTokenElement(level) {
  const token = SIZE_TOKENS[level];
  const el = document.createElement(token.tag);
  const s = token.style;
  el.style.fontFamily = s.fontFamily;
  el.style.fontSize = s.fontSize + "px";
  el.style.fontWeight = s.fontWeight;
  el.style.color = s.color;
  el.style.letterSpacing = s.letterSpacing;
  el.style.lineHeight = s.lineHeight;
  el.style.margin = s.margin;
  el.setAttribute("data-size", level);
  return el;
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = node.tagName.toLowerCase();

  // Lists — preserve structure
  if (LIST_TAGS.has(tag)) {
    const el = document.createElement(tag);
    for (const child of node.childNodes) {
      if (child.tagName?.toLowerCase() === "li") {
        const li = document.createElement("li");
        li.style.color = "#AEAEB2";
        li.style.fontSize = "15px";
        li.style.lineHeight = "1.6";
        li.style.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
        for (const c of child.childNodes) {
          const cleaned = sanitizeNode(c);
          if (cleaned) li.appendChild(cleaned);
        }
        el.appendChild(li);
      }
    }
    return el;
  }

  // Inline marks — allowed
  if (ALLOWED_INLINE.has(tag)) {
    const el = document.createElement(tag === "strong" ? "b" : tag === "em" ? "i" : tag);
    if (tag === "a") {
      const href = node.getAttribute("href");
      if (href) {
        el.setAttribute("href", href);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.style.color = "#9D82FF";
        el.style.textDecoration = "underline";
      }
    }
    for (const child of node.childNodes) {
      const cleaned = sanitizeNode(child);
      if (cleaned) el.appendChild(cleaned);
    }
    return el;
  }

  // Block elements — detect size level and map to token
  if (BLOCK_TAGS.has(tag) || tag.match(/^h[1-6]$/)) {
    const level = detectSizeLevel(node) || "body";
    const el = buildTokenElement(level);
    for (const child of node.childNodes) {
      const cleaned = sanitizeNode(child);
      if (cleaned) el.appendChild(cleaned);
    }
    const text = el.textContent?.trim();
    if (!text) return null; // skip empty blocks
    return el;
  }

  // Everything else (span, font, table, etc.) — unwrap, keep children
  // BUT first check if this span/font had a meaningful size
  const level = detectSizeLevel(node);
  if (level && level !== "body") {
    const el = buildTokenElement(level);
    for (const child of node.childNodes) {
      const cleaned = sanitizeNode(child);
      if (cleaned) el.appendChild(cleaned);
    }
    return el;
  }

  const frag = document.createDocumentFragment();
  for (const child of node.childNodes) {
    const cleaned = sanitizeNode(child);
    if (cleaned) frag.appendChild(cleaned);
  }
  return frag;
}

function sanitizeHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const result = document.createElement("div");

  for (const child of doc.body.childNodes) {
    const cleaned = sanitizeNode(child);
    if (cleaned) result.appendChild(cleaned);
  }

  return result.innerHTML
    .replace(/&nbsp;/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/<(h[23]|p)[^>]*>\s*<\/\1>/gi, "") // empty blocks
    .trim();
}

function classifyPaste(html) {
  if (!html) return "clean";
  if (/mso-|class="Mso/i.test(html)) return "word";
  if (/docs-internal/i.test(html)) return "gdocs";
  if (/style\s*=/i.test(html)) return "rich";
  return "clean";
}

/* ─────────────────────────────────────────────
   Post types
   ───────────────────────────────────────────── */
const TYPE_META = {
  event:        { label: "Event",        icon: "📅", accent: "#9D82FF" },
  announcement: { label: "Announcement", icon: "📣", accent: "#AEAEB2" },
  celebration:  { label: "Celebration",  icon: "🎉", accent: "#FF9070" },
  tip:          { label: "Wellness tip", icon: "✨", accent: "#6DD8FF" },
  update:       { label: "Update",       icon: "📋", accent: "#C39FFF" },
};

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */
const BoldIcon = ({ active }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active ? "#F2F2F7" : "#636366"} strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = ({ active }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={active ? "#F2F2F7" : "#636366"} strokeWidth="2.5" strokeLinecap="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const LinkIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ListIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2" strokeLinecap="round">
    <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1" fill="#636366" /><circle cx="4" cy="12" r="1" fill="#636366" /><circle cx="4" cy="18" r="1" fill="#636366" />
  </svg>
);

const EraserIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#FF9070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5" /><path d="M6 17L17 6" />
  </svg>
);

const EyeIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const WarnIcon = ({ color = "#FFD07A" }) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" stroke="#111" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="#111" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────────────────────────
   Toolbar button
   ───────────────────────────────────────────── */
const ToolBtn = ({ onClick, active, title, children }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? "rgba(255,255,255,0.12)" : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
  >
    {children}
  </button>
);

/* ─────────────────────────────────────────────
   Size level picker — the key new piece
   ───────────────────────────────────────────── */
const SizePicker = ({ onApply }) => {
  const [open, setOpen] = useState(false);

  const apply = (level) => {
    onApply(level);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
        style={{
          height: 32, padding: "0 10px", borderRadius: 8, border: "none", cursor: "pointer",
          background: open ? "rgba(255,255,255,0.12)" : "transparent",
          display: "flex", alignItems: "center", gap: 4,
          color: "#636366", fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em",
          transition: "background 0.15s",
        }}
      >
        Aa
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: "spring", damping: 22, stiffness: 380 }}
              style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
                background: "#2C2C2E", borderRadius: 14, overflow: "hidden",
                boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                minWidth: 200,
              }}
            >
              {Object.entries(SIZE_TOKENS).map(([level, token]) => (
                <button
                  key={level}
                  onMouseDown={e => { e.preventDefault(); apply(level); }}
                  style={{
                    width: "100%", padding: "10px 14px", border: "none",
                    background: "transparent", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background 0.12s",
                    borderBottom: level !== "body" ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{
                    fontFamily: token.style.fontFamily,
                    fontSize: Math.min(token.style.fontSize, 16),
                    fontWeight: token.style.fontWeight,
                    color: "#F2F2F7",
                    letterSpacing: token.style.letterSpacing,
                  }}>
                    {token.label}
                  </span>
                  <span style={{ fontSize: 10, color: "#636366", fontWeight: 600, letterSpacing: "0.04em" }}>
                    {token.style.fontSize}px
                  </span>
                </button>
              ))}
              <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 10, color: "#636366", letterSpacing: "-0.01em", lineHeight: 1.4 }}>
                Size maps to your design tokens.<br />Raw pt/px values from paste are never used.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Rich editor
   ───────────────────────────────────────────── */
const RichEditor = ({ onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [pasteAlert, setPasteAlert] = useState(null);
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);

  const emit = useCallback(() => {
    onChange?.(editorRef.current?.innerHTML || "");
  }, [onChange]);

  /* ── Paste handler ── */
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    const type = classifyPaste(html);
    if (type !== "clean") {
      setPasteAlert(type);
      setTimeout(() => setPasteAlert(null), 5000);
    }

    const content = html
      ? sanitizeHTML(html)
      : text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");

    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const frag = range.createContextualFragment(content);
      range.insertNode(frag);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.innerHTML += content;
    }

    emit();
  }, [emit]);

  const updateActiveStates = useCallback(() => {
    setBoldActive(document.queryCommandState("bold"));
    setItalicActive(document.queryCommandState("italic"));
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveStates);
    return () => document.removeEventListener("selectionchange", updateActiveStates);
  }, [updateActiveStates]);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    emit();
  };

  /* Apply a size token to the current block/selection */
  const applySize = useCallback((level) => {
    editorRef.current?.focus();
    const token = SIZE_TOKENS[level];
    const sel = window.getSelection();
    if (!sel?.rangeCount) return;

    const range = sel.getRangeAt(0);

    // Find the block-level ancestor
    let block = range.commonAncestorContainer;
    while (block && block !== editorRef.current && !["P", "H1", "H2", "H3", "DIV"].includes(block.nodeName)) {
      block = block.parentNode;
    }

    if (block && block !== editorRef.current) {
      // Replace the block tag with the token element
      const newEl = buildTokenElement(level);
      newEl.innerHTML = block.innerHTML;
      block.parentNode.replaceChild(newEl, block);
    } else {
      // No block context — wrap selection in a new block
      const newEl = buildTokenElement(level);
      try {
        range.surroundContents(newEl);
      } catch {
        const content = range.extractContents();
        newEl.appendChild(content);
        range.insertNode(newEl);
      }
    }

    emit();
  }, [emit]);

  /* Word count */
  const wordCount = (editorRef.current?.textContent?.match(/\S+/g) || []).length;

  const alertMessages = {
    word: { text: "Pasted from Word — styles stripped. Size hierarchy mapped to your design tokens.", color: "#FFD07A" },
    gdocs: { text: "Pasted from Google Docs — styles stripped. Headings mapped to your size tokens.", color: "#6DD8FF" },
    rich: { text: "Inline styles removed. Font sizes mapped to Heading / Subheading / Body.", color: "#9D82FF" },
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap",
        padding: "6px 8px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Size picker */}
        <SizePicker onApply={applySize} />

        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

        <ToolBtn onClick={() => exec("bold")} active={boldActive} title="Bold (⌘B)">
          <BoldIcon active={boldActive} />
        </ToolBtn>
        <ToolBtn onClick={() => exec("italic")} active={italicActive} title="Italic (⌘I)">
          <ItalicIcon active={italicActive} />
        </ToolBtn>

        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

        <ToolBtn onClick={() => { const url = window.prompt("URL:"); if (url) exec("createLink", url); }} title="Insert link">
          <LinkIcon />
        </ToolBtn>
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <ListIcon />
        </ToolBtn>

        <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 2px" }} />

        <ToolBtn onClick={() => { exec("removeFormat"); emit(); }} title="Strip formatting from selection">
          <EraserIcon />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onPaste={handlePaste}
          onInput={emit}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          style={{
            minHeight: 160,
            padding: "14px 16px",
            outline: "none",
            caretColor: "#9D82FF",
            /* Base body style — headings/blocks override this per-element */
            fontSize: 15,
            lineHeight: 1.6,
            color: "#AEAEB2",
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: "-0.01em",
          }}
        />
        {/* Placeholder */}
        <style>{`
          [contenteditable]:empty::before {
            content: "${placeholder || "Write or paste content…"}";
            color: #636366; pointer-events: none;
            position: absolute; top: 14px; left: 16px;
            font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          }
          /* Heading tokens */
          [contenteditable] h2[data-size="large"] {
            font-family: Syne, -apple-system, sans-serif !important;
            font-size: 22px !important; font-weight: 700 !important;
            color: #F2F2F7 !important; letter-spacing: -0.025em !important;
            line-height: 1.2 !important; margin: 10px 0 4px !important;
            background: transparent !important;
          }
          [contenteditable] h3[data-size="medium"] {
            font-family: Syne, -apple-system, sans-serif !important;
            font-size: 17px !important; font-weight: 600 !important;
            color: #F2F2F7 !important; letter-spacing: -0.015em !important;
            line-height: 1.3 !important; margin: 8px 0 4px !important;
            background: transparent !important;
          }
          [contenteditable] p[data-size="body"],
          [contenteditable] p {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: 15px !important; font-weight: 400 !important;
            color: #AEAEB2 !important; letter-spacing: -0.01em !important;
            line-height: 1.6 !important; margin: 2px 0 !important;
            background: transparent !important;
          }
          /* Inline marks */
          [contenteditable] b, [contenteditable] strong {
            font-weight: 700 !important; color: #F2F2F7 !important;
          }
          [contenteditable] i, [contenteditable] em {
            font-style: italic !important;
          }
          [contenteditable] a {
            color: #9D82FF !important; text-decoration: underline !important;
            text-underline-offset: 3px !important;
          }
          [contenteditable] ul {
            padding-left: 20px !important; margin: 6px 0 !important;
          }
          [contenteditable] li {
            color: #AEAEB2 !important; font-size: 15px !important;
            line-height: 1.6 !important; margin: 3px 0 !important;
          }
          /* Nuclear override — kill any surviving inline styles */
          [contenteditable] span {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: 15px !important;
            color: #AEAEB2 !important;
            background: transparent !important;
          }
        `}</style>
      </div>

      {/* Footer */}
      <div style={{
        padding: "6px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 11, color: "#636366",
      }}>
        <span>{wordCount} words</span>
        <span style={{ letterSpacing: "-0.01em" }}>
          Headings · Bold · Italic · Links · Lists
        </span>
      </div>

      {/* Paste alert */}
      <AnimatePresence>
        {pasteAlert && alertMessages[pasteAlert] && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              margin: "0 12px 10px",
              padding: "9px 12px",
              borderRadius: 10,
              background: `${alertMessages[pasteAlert].color}14`,
              border: `1px solid ${alertMessages[pasteAlert].color}30`,
              display: "flex", alignItems: "flex-start", gap: 8,
              fontSize: 12, color: alertMessages[pasteAlert].color,
              letterSpacing: "-0.01em", lineHeight: 1.5,
            }}
          >
            <WarnIcon color={alertMessages[pasteAlert].color} />
            <span>{alertMessages[pasteAlert].text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Feed preview
   ───────────────────────────────────────────── */
const FeedPreview = ({ type, title, body }) => {
  const meta = TYPE_META[type];
  const isEmpty = !title.trim() && !body.replace(/<[^>]+>/g, "").trim();

  return (
    <div style={{
      background: "#1C1C1E", borderRadius: 20, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)",
    }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.accent} 0%, transparent 100%)` }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>AK</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F7" }}>Aanya Kapoor</div>
            <div style={{ fontSize: 11, color: "#636366" }}>People Ops · just now</div>
          </div>
        </div>
        <span style={{ padding: "3px 8px 3px 5px", borderRadius: 999, background: `${meta.accent}22`, fontSize: 10, fontWeight: 700, color: meta.accent, letterSpacing: "0.05em" }}>
          {meta.icon} {meta.label.toUpperCase()}
        </span>
      </div>
      <div style={{ padding: "0 16px 16px" }}>
        {isEmpty ? (
          <div style={{ fontSize: 14, color: "#3A3A3C", fontStyle: "italic" }}>
            Your post preview appears here as you type…
          </div>
        ) : (
          <>
            {title && (
              <div style={{
                fontFamily: "Syne, -apple-system, sans-serif",
                fontSize: 19, fontWeight: 700, color: "#F2F2F7",
                letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 8,
              }}>
                {title}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: body }} style={{ fontSize: 15, color: "#AEAEB2", lineHeight: 1.6, letterSpacing: "-0.01em" }} />
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main
   ───────────────────────────────────────────── */
export default function PostComposer() {
  const [postType, setPostType] = useState("announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const meta = TYPE_META[postType];

  return (
    <div style={{ minHeight: "100vh", background: "#111113", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 80 }}>
      <style>{`* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } ::-webkit-scrollbar { display: none; }`}</style>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(17,17,19,0.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "#F2F2F7", letterSpacing: "-0.02em" }}>
          New post
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ key: "write", icon: <EditIcon /> }, { key: "preview", icon: <EyeIcon /> }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                background: activeTab === tab.key ? "#F2F2F7" : "rgba(255,255,255,0.09)",
                color: activeTab === tab.key ? "#111113" : "#AEAEB2",
                fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em",
                transition: "all 0.15s ease",
                textTransform: "capitalize",
              }}
            >
              {tab.icon} {tab.key}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Post type */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#636366", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Post type
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(TYPE_META).map(([key, m]) => {
              const active = postType === key;
              return (
                <button key={key} onClick={() => setPostType(key)} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  borderRadius: 999, cursor: "pointer",
                  background: active ? `${m.accent}22` : "rgba(255,255,255,0.06)",
                  border: `1px solid ${active ? `${m.accent}50` : "transparent"}`,
                  color: active ? m.accent : "#AEAEB2",
                  fontSize: 12, fontWeight: active ? 600 : 400,
                  letterSpacing: "-0.01em", transition: "all 0.15s ease",
                }}>
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "write" ? (
            <motion.div key="write" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>

              {/* Title */}
              <div style={{ background: "#1C1C1E", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.07)", marginBottom: 10 }}>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Title"
                  maxLength={120}
                  style={{
                    width: "100%", padding: "14px 16px", background: "transparent", border: "none",
                    fontFamily: "Syne, -apple-system, sans-serif",
                    fontSize: 20, fontWeight: 700, color: "#F2F2F7",
                    letterSpacing: "-0.025em", caretColor: meta.accent,
                  }}
                />
              </div>

              {/* Body editor */}
              <div style={{ background: "#1C1C1E", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.07)", marginBottom: 16, position: "relative" }}>
                <RichEditor onChange={setBody} placeholder="Write or paste from any source…" />
              </div>

              {/* Size token explainer */}
              <div style={{
                padding: "12px 14px", borderRadius: 14, marginBottom: 16,
                background: "rgba(157,130,255,0.08)", border: "1px solid rgba(157,130,255,0.18)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#9D82FF", marginBottom: 8, letterSpacing: "-0.01em" }}>
                  ✦ How font sizes work
                </div>

                {/* Size token preview */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                  {Object.entries(SIZE_TOKENS).map(([level, token]) => (
                    <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ ...token.style, fontSize: Math.min(token.style.fontSize, 15), margin: 0, lineHeight: 1, width: 120, flexShrink: 0 }}>
                        {token.label}
                      </span>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                      <span style={{ fontSize: 10, color: "#636366", fontWeight: 600, letterSpacing: "0.04em", flexShrink: 0 }}>
                        {token.style.fontSize}px · {token.style.fontFamily.split(",")[0]}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, color: "#AEAEB2", lineHeight: 1.6, letterSpacing: "-0.01em" }}>
                  Raw pixel values (11pt, 24px, 1.5em) from Word or Google Docs are <span style={{ color: "#FF9070" }}>never passed through</span>. Instead, we detect heading intent and map it to these three tokens — so your design system stays intact regardless of source.
                </div>
              </div>

              {/* Publish */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={!title.trim()}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 999, border: "none", cursor: title.trim() ? "pointer" : "not-allowed",
                  background: title.trim() ? `linear-gradient(135deg, ${meta.accent} 0%, ${meta.accent}CC 100%)` : "rgba(255,255,255,0.06)",
                  color: title.trim() ? "#0A0A0C" : "#636366",
                  fontFamily: "Syne, -apple-system, sans-serif",
                  fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
                  boxShadow: title.trim() ? `0 6px 20px ${meta.accent}45` : "none",
                  transition: "all 0.2s ease",
                }}
              >
                Publish {meta.icon}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="preview" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#636366", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                How it appears in the feed
              </div>
              <FeedPreview type={postType} title={title} body={body} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}