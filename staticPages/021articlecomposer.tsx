// import { useState, useRef, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// /* ─────────────────────────────────────────────
//    BLOCK TYPES
//    The core model — a post is an ordered list of
//    blocks, not a blob of HTML.
//    ───────────────────────────────────────────── */

// // text | image | heading | subheading | list
// // Order in the array IS the article order.

// const SIZE_TOKENS = {
//   heading:    { fontSize: 22, fontWeight: 700, fontFamily: "Syne, -apple-system, sans-serif", color: "#F2F2F7", letterSpacing: "-0.025em", lineHeight: 1.2 },
//   subheading: { fontSize: 17, fontWeight: 600, fontFamily: "Syne, -apple-system, sans-serif", color: "#F2F2F7", letterSpacing: "-0.015em", lineHeight: 1.3 },
//   body:       { fontSize: 15, fontWeight: 400, fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: "#AEAEB2", letterSpacing: "-0.01em", lineHeight: 1.65 },
// };

// /* ─────────────────────────────────────────────
//    CLIPBOARD PARSER
//    Walks the DOM tree and emits blocks in order.
//    ───────────────────────────────────────────── */
// function detectTextLevel(node) {
//   const tag = node.tagName?.toLowerCase();
//   if (!tag) return "body";
//   if (tag === "h1" || tag === "h2") return "heading";
//   if (tag === "h3" || tag === "h4" || tag === "h5") return "subheading";
//   const style = node.getAttribute?.("style") || "";
//   const sizeMatch = style.match(/font-size\s*:\s*([\d.]+)(pt|px|em|rem)/i);
//   if (sizeMatch) {
//     let px = parseFloat(sizeMatch[1]);
//     const unit = sizeMatch[2].toLowerCase();
//     if (unit === "pt") px *= 1.333;
//     if (unit === "em" || unit === "rem") px *= 16;
//     if (px >= 20) return "heading";
//     if (px >= 16) return "subheading";
//   }
//   return "body";
// }

// function cleanInlineHTML(node) {
//   // Returns sanitized innerHTML — bold, italic, links only
//   const allowed = new Set(["b", "strong", "i", "em", "a", "br", "span"]);
//   function walk(n) {
//     if (n.nodeType === Node.TEXT_NODE) return n.textContent;
//     if (n.nodeType !== Node.ELEMENT_NODE) return "";
//     const tag = n.tagName.toLowerCase();
//     const children = Array.from(n.childNodes).map(walk).join("");
//     if (tag === "b" || tag === "strong") return `<b>${children}</b>`;
//     if (tag === "i" || tag === "em") return `<i>${children}</i>`;
//     if (tag === "a") {
//       const href = n.getAttribute("href");
//       return href ? `<a href="${href}" target="_blank" rel="noopener">${children}</a>` : children;
//     }
//     if (tag === "br") return "<br>";
//     return children;
//   }
//   return walk(node).trim();
// }

// function parseClipboardToBlocks(html) {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");
//   const blocks = [];

//   function walkNode(node) {
//     if (node.nodeType === Node.TEXT_NODE) {
//       const text = node.textContent?.trim();
//       if (text) {
//         // Inline text node — append to last text block or create new body block
//         const last = blocks[blocks.length - 1];
//         if (last?.type === "body") {
//           last.html += " " + text;
//         } else {
//           blocks.push({ id: uid(), type: "body", html: text });
//         }
//       }
//       return;
//     }

//     if (node.nodeType !== Node.ELEMENT_NODE) return;
//     const tag = node.tagName.toLowerCase();

//     // ── IMAGE ──
//     if (tag === "img") {
//       const src = node.getAttribute("src");
//       const alt = node.getAttribute("alt") || "";
//       if (src && !src.startsWith("data:image/gif")) { // skip tracking pixels
//         blocks.push({
//           id: uid(),
//           type: "image",
//           src,
//           alt,
//           status: "pending", // pending | uploading | done | error
//           localPreview: src.startsWith("data:") ? src : null,
//         });
//       }
//       return;
//     }

//     // ── FIGURE (image + caption) ──
//     if (tag === "figure") {
//       const img = node.querySelector("img");
//       const caption = node.querySelector("figcaption");
//       if (img) {
//         const src = img.getAttribute("src");
//         if (src) {
//           blocks.push({
//             id: uid(),
//             type: "image",
//             src,
//             alt: img.getAttribute("alt") || "",
//             caption: caption?.textContent?.trim() || "",
//             status: "pending",
//             localPreview: src.startsWith("data:") ? src : null,
//           });
//         }
//       }
//       return;
//     }

//     // ── HEADINGS ──
//     if (tag.match(/^h[1-6]$/)) {
//       const level = tag === "h1" || tag === "h2" ? "heading" : "subheading";
//       const html = cleanInlineHTML(node);
//       if (html.trim()) blocks.push({ id: uid(), type: level, html });
//       return;
//     }

//     // ── LIST ──
//     if (tag === "ul" || tag === "ol") {
//       const items = Array.from(node.querySelectorAll("li"))
//         .map(li => cleanInlineHTML(li))
//         .filter(Boolean);
//       if (items.length) blocks.push({ id: uid(), type: "list", ordered: tag === "ol", items });
//       return;
//     }

//     // ── BLOCKQUOTE ──
//     if (tag === "blockquote") {
//       const html = cleanInlineHTML(node);
//       if (html.trim()) blocks.push({ id: uid(), type: "quote", html });
//       return;
//     }

//     // ── PARAGRAPHS & DIVS — check for nested images first ──
//     if (tag === "p" || tag === "div" || tag === "section" || tag === "article") {
//       const hasImages = node.querySelector("img");
//       if (hasImages) {
//         // Has images inside — recurse to preserve order
//         for (const child of node.childNodes) walkNode(child);
//         return;
//       }

//       const textLevel = detectTextLevel(node);
//       const html = cleanInlineHTML(node);
//       if (html.trim()) {
//         blocks.push({ id: uid(), type: textLevel, html });
//       }
//       return;
//     }

//     // ── EVERYTHING ELSE — recurse ──
//     for (const child of node.childNodes) walkNode(child);
//   }

//   for (const child of doc.body.childNodes) walkNode(child);

//   // Merge adjacent same-type text blocks that ended up fragmented
//   return mergeAdjacentTextBlocks(blocks);
// }

// function mergeAdjacentTextBlocks(blocks) {
//   const merged = [];
//   for (const b of blocks) {
//     const last = merged[merged.length - 1];
//     if (last && last.type === b.type && ["body", "heading", "subheading"].includes(b.type)) {
//       // Only merge body blocks (not headings — each heading is distinct)
//       if (b.type === "body") {
//         last.html += " " + b.html;
//         continue;
//       }
//     }
//     merged.push({ ...b });
//   }
//   return merged;
// }

// function uid() {
//   return Math.random().toString(36).slice(2, 9);
// }

// /* ─────────────────────────────────────────────
//    SIMULATED IMAGE UPLOAD
//    In prod: POST to /socialapi/media → Azure Blob
//    Here: simulate 1-2s delay, return picsum URL
//    ───────────────────────────────────────────── */
// async function simulateUpload(block) {
//   await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

//   // In prod you'd upload the actual image data here.
//   // We return a reliable picsum URL as a stand-in for the CDN URL.
//   const seeds = ["nature2","team2","run1","yoga2","office","calm1","wellness","energy"];
//   const seed = seeds[Math.floor(Math.random() * seeds.length)];
//   return `https://picsum.photos/seed/${seed}/900/600`;
// }

// /* ─────────────────────────────────────────────
//    Icons
//    ───────────────────────────────────────────── */
// const EyeIcon = () => (
//   <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
//   </svg>
// );
// const EditIcon = () => (
//   <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
//   </svg>
// );
// const UploadIcon = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
//     <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
//   </svg>
// );
// const ImageIcon = ({ size = 18 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
//     <polyline points="21 15 16 10 5 21"/>
//   </svg>
// );
// const CheckIcon = ({ size = 14, color = "#4CD97B" }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
//     <polyline points="20 6 9 17 4 12"/>
//   </svg>
// );
// const AlertIcon = ({ size = 14 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF9070">
//     <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
//     <line x1="12" y1="9" x2="12" y2="13" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
//     <line x1="12" y1="17" x2="12.01" y2="17" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
//   </svg>
// );
// const TrashIcon = ({ size = 15 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//     <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
//     <path d="M9 6V4h6v2"/>
//   </svg>
// );
// const GripIcon = ({ size = 15 }) => (
//   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2" strokeLinecap="round">
//     <circle cx="9" cy="7" r="1" fill="#636366"/><circle cx="15" cy="7" r="1" fill="#636366"/>
//     <circle cx="9" cy="12" r="1" fill="#636366"/><circle cx="15" cy="12" r="1" fill="#636366"/>
//     <circle cx="9" cy="17" r="1" fill="#636366"/><circle cx="15" cy="17" r="1" fill="#636366"/>
//   </svg>
// );

// /* ─────────────────────────────────────────────
//    BLOCK RENDERERS (editor mode)
//    ───────────────────────────────────────────── */
// const BlockEditor = ({ block, index, onUpdate, onDelete, uploading }) => {
//   const s = SIZE_TOKENS;

//   const blockStyle = {
//     heading: { ...s.heading, fontSize: "22px" },
//     subheading: { ...s.subheading, fontSize: "17px" },
//     body: { ...s.body, fontSize: "15px" },
//   };

//   const isText = ["heading", "subheading", "body"].includes(block.type);
//   const isImage = block.type === "image";
//   const isList = block.type === "list";
//   const isQuote = block.type === "quote";

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -4, scale: 0.98 }}
//       transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
//       style={{
//         display: "flex",
//         alignItems: "flex-start",
//         gap: 8,
//         padding: "4px 0",
//         borderRadius: 10,
//         position: "relative",
//       }}
//       className="block-row"
//     >
//       {/* Drag handle */}
//       <div style={{
//         width: 20, paddingTop: isText ? 4 : 8,
//         opacity: 0, transition: "opacity 0.15s",
//         cursor: "grab", flexShrink: 0,
//       }} className="drag-handle">
//         <GripIcon size={13} />
//       </div>

//       {/* Block content */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         {isText && (
//           <div
//             contentEditable
//             suppressContentEditableWarning
//             onInput={e => onUpdate(block.id, { html: e.currentTarget.innerHTML })}
//             dangerouslySetInnerHTML={{ __html: block.html }}
//             style={{
//               outline: "none",
//               caretColor: "#9D82FF",
//               ...blockStyle[block.type],
//               minHeight: "1.6em",
//               wordBreak: "break-word",
//               WebkitFontSmoothing: "antialiased",
//             }}
//           />
//         )}

//         {isImage && (
//           <div style={{ borderRadius: 14, overflow: "hidden", position: "relative", background: "#2C2C2E" }}>
//             {/* Upload status bar */}
//             {block.status === "uploading" && (
//               <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#2C2C2E", zIndex: 2 }}>
//                 <motion.div
//                   initial={{ width: "0%" }}
//                   animate={{ width: "100%" }}
//                   transition={{ duration: 1.5, ease: "easeInOut" }}
//                   style={{ height: "100%", background: "linear-gradient(90deg, #9D82FF, #6DD8FF)" }}
//                 />
//               </div>
//             )}

//             {/* Image */}
//             {(block.uploadedUrl || block.localPreview || block.status === "done") && (
//               <img
//                 src={block.uploadedUrl || block.localPreview || block.src}
//                 alt={block.alt}
//                 style={{ width: "100%", display: "block", maxHeight: 380, objectFit: "cover" }}
//               />
//             )}

//             {/* External URL not yet uploaded */}
//             {!block.uploadedUrl && !block.localPreview && block.status === "pending" && (
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, flexDirection: "column", gap: 8 }}>
//                 <div style={{ color: "#636366", fontSize: 12 }}>Waiting to upload…</div>
//               </div>
//             )}

//             {/* Status overlay */}
//             <div style={{
//               position: "absolute", bottom: 8, right: 8,
//               display: "flex", alignItems: "center", gap: 5,
//               padding: "4px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600,
//               background: block.status === "done" ? "rgba(76,217,123,0.9)"
//                 : block.status === "uploading" ? "rgba(157,130,255,0.9)"
//                 : block.status === "error" ? "rgba(255,144,112,0.9)"
//                 : "rgba(0,0,0,0.65)",
//               color: block.status === "done" || block.status === "uploading" ? "#0A0A0C" : "#fff",
//             }}>
//               {block.status === "uploading" && <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>↻</motion.span> Uploading</>}
//               {block.status === "done" && <><CheckIcon size={10} color="#0A0A0C" /> Uploaded to CDN</>}
//               {block.status === "error" && <><AlertIcon size={10} /> Upload failed — tap to retry</>}
//               {block.status === "pending" && <><UploadIcon size={10} /> External URL</>}
//             </div>

//             {/* Caption */}
//             {block.caption !== undefined && (
//               <div
//                 contentEditable
//                 suppressContentEditableWarning
//                 onInput={e => onUpdate(block.id, { caption: e.currentTarget.textContent })}
//                 style={{
//                   padding: "8px 12px", fontSize: 12, color: "#636366",
//                   fontStyle: "italic", outline: "none", background: "#1C1C1E",
//                   minHeight: "1.4em", caretColor: "#9D82FF",
//                 }}
//               >
//                 {block.caption || ""}
//               </div>
//             )}
//           </div>
//         )}

//         {isList && (
//           <ul style={{ paddingLeft: 20, margin: 0 }}>
//             {block.items.map((item, i) => (
//               <li key={i} style={{ ...s.body, fontSize: "15px", marginBottom: 4 }}
//                 dangerouslySetInnerHTML={{ __html: item }} />
//             ))}
//           </ul>
//         )}

//         {isQuote && (
//           <div style={{
//             borderLeft: "3px solid #9D82FF", paddingLeft: 14,
//             ...s.body, fontSize: "15px", fontStyle: "italic", color: "#AEAEB2",
//           }} dangerouslySetInnerHTML={{ __html: block.html }} />
//         )}
//       </div>

//       {/* Delete button */}
//       <button
//         onClick={() => onDelete(block.id)}
//         style={{
//           width: 28, height: 28, borderRadius: 8, border: "none",
//           background: "rgba(255,144,112,0.12)", color: "#FF9070",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           cursor: "pointer", flexShrink: 0, marginTop: isText ? 2 : 6,
//           opacity: 0, transition: "opacity 0.15s",
//         }}
//         className="delete-btn"
//       >
//         <TrashIcon size={13} />
//       </button>
//     </motion.div>
//   );
// };

// /* ─────────────────────────────────────────────
//    ARTICLE PREVIEW
//    Renders blocks as the final published post
//    ───────────────────────────────────────────── */
// const ArticlePreview = ({ title, blocks }) => {
//   const s = SIZE_TOKENS;
//   const isEmpty = !title.trim() && blocks.length === 0;

//   return (
//     <div style={{
//       background: "#1C1C1E", borderRadius: 20, overflow: "hidden",
//       boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)",
//     }}>
//       <div style={{ height: 2, background: "linear-gradient(90deg, #9D82FF 0%, transparent 100%)" }} />

//       {/* Poster */}
//       <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" }}>
//         <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #9D82FF, #C39FFF)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>AK</div>
//         <div>
//           <div style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F7" }}>Aanya Kapoor</div>
//           <div style={{ fontSize: 11, color: "#636366" }}>People Ops · just now</div>
//         </div>
//         <span style={{ marginLeft: "auto", padding: "3px 8px", borderRadius: 999, background: "rgba(157,130,255,0.18)", fontSize: 10, fontWeight: 700, color: "#9D82FF", letterSpacing: "0.05em" }}>
//           📣 ANNOUNCEMENT
//         </span>
//       </div>

//       <div style={{ padding: "0 16px 20px" }}>
//         {isEmpty ? (
//           <div style={{ fontSize: 14, color: "#3A3A3C", fontStyle: "italic", padding: "8px 0" }}>
//             Paste or type content to see preview…
//           </div>
//         ) : (
//           <>
//             {title && (
//               <h1 style={{ ...s.heading, fontSize: "22px", margin: "0 0 14px" }}>
//                 {title}
//               </h1>
//             )}

//             {blocks.map((block, i) => {
//               if (block.type === "heading") return (
//                 <h2 key={block.id} style={{ ...s.heading, fontSize: "20px", margin: "16px 0 8px" }}
//                   dangerouslySetInnerHTML={{ __html: block.html }} />
//               );
//               if (block.type === "subheading") return (
//                 <h3 key={block.id} style={{ ...s.subheading, fontSize: "16px", margin: "14px 0 6px" }}
//                   dangerouslySetInnerHTML={{ __html: block.html }} />
//               );
//               if (block.type === "body") return (
//                 <p key={block.id} style={{ ...s.body, fontSize: "15px", margin: "0 0 10px" }}
//                   dangerouslySetInnerHTML={{ __html: block.html }} />
//               );
//               if (block.type === "image") return (
//                 <figure key={block.id} style={{ margin: "16px -16px" }}>
//                   {(block.uploadedUrl || block.localPreview || block.status === "done") ? (
//                     <img
//                       src={block.uploadedUrl || block.localPreview || block.src}
//                       alt={block.alt}
//                       style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "cover" }}
//                     />
//                   ) : (
//                     <div style={{ height: 160, background: "#2C2C2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                       <span style={{ color: "#636366", fontSize: 13 }}>
//                         {block.status === "uploading" ? "Uploading image…" : "Image pending upload"}
//                       </span>
//                     </div>
//                   )}
//                   {block.caption && (
//                     <figcaption style={{ padding: "6px 16px", fontSize: 12, color: "#636366", fontStyle: "italic", textAlign: "center" }}>
//                       {block.caption}
//                     </figcaption>
//                   )}
//                 </figure>
//               );
//               if (block.type === "list") return (
//                 <ul key={block.id} style={{ paddingLeft: 20, margin: "0 0 10px" }}>
//                   {block.items.map((item, idx) => (
//                     <li key={idx} style={{ ...s.body, fontSize: "15px", marginBottom: 4 }}
//                       dangerouslySetInnerHTML={{ __html: item }} />
//                   ))}
//                 </ul>
//               );
//               if (block.type === "quote") return (
//                 <blockquote key={block.id} style={{ borderLeft: "3px solid #9D82FF", paddingLeft: 14, margin: "12px 0", ...s.body, fontSize: "15px", fontStyle: "italic" }}
//                   dangerouslySetInnerHTML={{ __html: block.html }} />
//               );
//               return null;
//             })}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ─────────────────────────────────────────────
//    MAIN COMPOSER
//    ───────────────────────────────────────────── */
// export default function ArticleComposer() {
//   const [title, setTitle] = useState("");
//   const [blocks, setBlocks] = useState([]);
//   const [activeTab, setActiveTab] = useState("write");
//   const [pasteInfo, setPasteInfo] = useState(null);
//   const dropRef = useRef(null);

//   /* ── Upload a single image block ── */
//   const uploadImageBlock = useCallback(async (id) => {
//     setBlocks(prev => prev.map(b => b.id === id ? { ...b, status: "uploading" } : b));
//     try {
//       const cdnUrl = await simulateUpload({ id });
//       setBlocks(prev => prev.map(b => b.id === id ? { ...b, status: "done", uploadedUrl: cdnUrl } : b));
//     } catch {
//       setBlocks(prev => prev.map(b => b.id === id ? { ...b, status: "error" } : b));
//     }
//   }, []);

//   /* ── Kick off uploads for all pending image blocks ── */
//   const uploadPendingImages = useCallback((newBlocks) => {
//     newBlocks.forEach(b => {
//       if (b.type === "image" && b.status === "pending") {
//         uploadImageBlock(b.id);
//       }
//     });
//   }, [uploadImageBlock]);

//   /* ── Paste handler ── */
//   const handlePaste = useCallback((e) => {
//     e.preventDefault();

//     const html = e.clipboardData.getData("text/html");
//     const text = e.clipboardData.getData("text/plain");

//     let newBlocks;
//     if (html && html.includes("<img")) {
//       // Rich content with images
//       newBlocks = parseClipboardToBlocks(html);
//       const imageCount = newBlocks.filter(b => b.type === "image").length;
//       const textCount = newBlocks.filter(b => ["body", "heading", "subheading"].includes(b.type)).length;
//       setPasteInfo({ imageCount, textCount, blockCount: newBlocks.length });
//       setTimeout(() => setPasteInfo(null), 5000);
//     } else if (html) {
//       // Rich text, no images
//       newBlocks = parseClipboardToBlocks(html);
//     } else {
//       // Plain text — create body blocks from paragraphs
//       newBlocks = text
//         .split(/\n{2,}/)
//         .map(para => para.trim())
//         .filter(Boolean)
//         .map(html => ({ id: uid(), type: "body", html }));
//     }

//     setBlocks(prev => [...prev, ...newBlocks]);
//     uploadPendingImages(newBlocks);
//   }, [uploadPendingImages]);

//   /* ── Manual image file drop ── */
//   const handleFileDrop = useCallback(async (e) => {
//     e.preventDefault();
//     const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
//     if (!files.length) return;

//     const newBlocks = files.map(file => ({
//       id: uid(),
//       type: "image",
//       src: URL.createObjectURL(file),
//       localPreview: URL.createObjectURL(file),
//       alt: file.name,
//       caption: "",
//       status: "pending",
//     }));

//     setBlocks(prev => {
//       const updated = [...prev, ...newBlocks];
//       return updated;
//     });

//     for (const b of newBlocks) {
//       await uploadImageBlock(b.id);
//     }
//   }, [uploadImageBlock]);

//   const updateBlock = useCallback((id, updates) => {
//     setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
//   }, []);

//   const deleteBlock = useCallback((id) => {
//     setBlocks(prev => prev.filter(b => b.id !== id));
//   }, []);

//   const imageBlocks = blocks.filter(b => b.type === "image");
//   const uploadingCount = imageBlocks.filter(b => b.status === "uploading").length;
//   const doneCount = imageBlocks.filter(b => b.status === "done").length;
//   const totalImages = imageBlocks.length;

//   return (
//     <div style={{ minHeight: "100vh", background: "#111113", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", paddingBottom: 80 }}>
//       <style>{`
//         * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
//         ::-webkit-scrollbar { display: none; }
//         .block-row:hover .drag-handle { opacity: 1 !important; }
//         .block-row:hover .delete-btn { opacity: 1 !important; }
//         [contenteditable] b, [contenteditable] strong { font-weight: 700 !important; color: #F2F2F7 !important; }
//         [contenteditable] i, [contenteditable] em { font-style: italic !important; }
//         [contenteditable] a { color: #9D82FF !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
//         [contenteditable]:empty::before { content: attr(data-placeholder); color: #3A3A3C; pointer-events: none; }
//       `}</style>

//       {/* Nav */}
//       <div style={{
//         position: "sticky", top: 0, zIndex: 30,
//         background: "rgba(17,17,19,0.94)", backdropFilter: "blur(24px)",
//         borderBottom: "1px solid rgba(255,255,255,0.06)",
//         padding: "12px 16px",
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//       }}>
//         <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "#F2F2F7", letterSpacing: "-0.02em" }}>
//           New article post
//         </div>
//         <div style={{ display: "flex", gap: 6 }}>
//           {[{ key: "write", icon: <EditIcon /> }, { key: "preview", icon: <EyeIcon /> }].map(tab => (
//             <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
//               display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
//               borderRadius: 999, border: "none", cursor: "pointer",
//               background: activeTab === tab.key ? "#F2F2F7" : "rgba(255,255,255,0.09)",
//               color: activeTab === tab.key ? "#111113" : "#AEAEB2",
//               fontSize: 12, fontWeight: 600, letterSpacing: "-0.01em", transition: "all 0.15s",
//               textTransform: "capitalize",
//             }}>
//               {tab.icon} {tab.key}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div style={{ padding: 16 }}>
//         <AnimatePresence mode="wait">
//           {activeTab === "write" ? (
//             <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

//               {/* Upload progress banner */}
//               {totalImages > 0 && (
//                 <div style={{
//                   padding: "10px 14px", borderRadius: 12, marginBottom: 12,
//                   background: uploadingCount > 0 ? "rgba(157,130,255,0.1)" : "rgba(76,217,123,0.1)",
//                   border: `1px solid ${uploadingCount > 0 ? "rgba(157,130,255,0.25)" : "rgba(76,217,123,0.25)"}`,
//                   display: "flex", alignItems: "center", gap: 8,
//                   fontSize: 12, letterSpacing: "-0.01em",
//                   color: uploadingCount > 0 ? "#9D82FF" : "#4CD97B",
//                 }}>
//                   {uploadingCount > 0 ? (
//                     <>
//                       <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block", fontSize: 14 }}>↻</motion.span>
//                       <span>Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""} to CDN… ({doneCount}/{totalImages} done)</span>
//                     </>
//                   ) : (
//                     <>
//                       <CheckIcon size={12} />
//                       <span>All {totalImages} image{totalImages > 1 ? "s" : ""} uploaded to your CDN · URLs replaced</span>
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* Paste info toast */}
//               <AnimatePresence>
//                 {pasteInfo && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -6 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -6 }}
//                     style={{
//                       padding: "10px 14px", borderRadius: 12, marginBottom: 12,
//                       background: "rgba(109,216,255,0.1)", border: "1px solid rgba(109,216,255,0.25)",
//                       fontSize: 12, color: "#6DD8FF", letterSpacing: "-0.01em", lineHeight: 1.5,
//                     }}
//                   >
//                     ✦ Parsed <strong>{pasteInfo.blockCount} blocks</strong> — {pasteInfo.textCount} text, {pasteInfo.imageCount} image{pasteInfo.imageCount !== 1 ? "s" : ""}. Images are uploading to your CDN in the background.
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Title */}
//               <div style={{ background: "#1C1C1E", borderRadius: 16, marginBottom: 10, boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
//                 <input
//                   value={title}
//                   onChange={e => setTitle(e.target.value)}
//                   placeholder="Post title"
//                   style={{
//                     width: "100%", padding: "14px 16px", background: "transparent", border: "none",
//                     fontFamily: "Syne, -apple-system, sans-serif",
//                     fontSize: 20, fontWeight: 700, color: "#F2F2F7",
//                     letterSpacing: "-0.025em", caretColor: "#9D82FF",
//                   }}
//                 />
//               </div>

//               {/* Block editor area */}
//               <div
//                 ref={dropRef}
//                 onPaste={handlePaste}
//                 onDragOver={e => e.preventDefault()}
//                 onDrop={handleFileDrop}
//                 tabIndex={0}
//                 style={{
//                   background: "#1C1C1E", borderRadius: 16, padding: "12px 8px 8px",
//                   boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
//                   minHeight: 200, outline: "none",
//                   position: "relative",
//                   marginBottom: 14,
//                 }}
//               >
//                 {blocks.length === 0 ? (
//                   <div style={{
//                     padding: "24px 16px", textAlign: "center",
//                     display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
//                   }}>
//                     <div style={{ display: "flex", gap: 12 }}>
//                       <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(157,130,255,0.1)", border: "1px dashed rgba(157,130,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9D82FF" }}>
//                         <UploadIcon size={20} />
//                       </div>
//                       <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(109,216,255,0.1)", border: "1px dashed rgba(109,216,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6DD8FF" }}>
//                         <ImageIcon size={20} />
//                       </div>
//                     </div>
//                     <div>
//                       <div style={{ fontSize: 14, fontWeight: 600, color: "#AEAEB2", marginBottom: 4, letterSpacing: "-0.01em" }}>
//                         Paste any article or content here
//                       </div>
//                       <div style={{ fontSize: 12, color: "#636366", lineHeight: 1.6, maxWidth: 280 }}>
//                         Images paste inline in their original position. Text is normalised to your design system. Drop image files here too.
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <AnimatePresence initial={false}>
//                     {blocks.map((block, index) => (
//                       <BlockEditor
//                         key={block.id}
//                         block={block}
//                         index={index}
//                         onUpdate={updateBlock}
//                         onDelete={deleteBlock}
//                       />
//                     ))}
//                   </AnimatePresence>
//                 )}
//               </div>

//               {/* What gets preserved explainer */}
//               <div style={{
//                 padding: "12px 14px", borderRadius: 14, marginBottom: 16,
//                 background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
//               }}>
//                 <div style={{ fontSize: 11, fontWeight: 700, color: "#AEAEB2", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
//                   What survives paste
//                 </div>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
//                   {[
//                     { icon: "📐", label: "Layout", detail: "Block order preserved exactly" },
//                     { icon: "🖼️", label: "Images", detail: "Extracted & uploaded to CDN" },
//                     { icon: "✦", label: "Hierarchy", detail: "H1→H2 mapped to size tokens" },
//                     { icon: "B",  label: "Bold",     detail: "Semantic bold preserved" },
//                     { icon: "I",  label: "Italic",   detail: "Semantic italic preserved" },
//                     { icon: "🔗", label: "Links",    detail: "href preserved, styles stripped" },
//                   ].map(item => (
//                     <div key={item.label} style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
//                       <div style={{ fontSize: 14, marginBottom: 3 }}>{item.icon}</div>
//                       <div style={{ fontSize: 11, fontWeight: 600, color: "#F2F2F7", marginBottom: 2 }}>{item.label}</div>
//                       <div style={{ fontSize: 10, color: "#636366", lineHeight: 1.4 }}>{item.detail}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Publish */}
//               <motion.button
//                 whileTap={{ scale: 0.98 }}
//                 disabled={!title.trim() && blocks.length === 0}
//                 style={{
//                   width: "100%", padding: "15px 0", borderRadius: 999, border: "none",
//                   cursor: (title.trim() || blocks.length > 0) ? "pointer" : "not-allowed",
//                   background: (title.trim() || blocks.length > 0)
//                     ? "linear-gradient(135deg, #9D82FF 0%, #C39FFF 100%)"
//                     : "rgba(255,255,255,0.06)",
//                   color: (title.trim() || blocks.length > 0) ? "#0A0A0C" : "#636366",
//                   fontFamily: "Syne, -apple-system, sans-serif",
//                   fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
//                   boxShadow: (title.trim() || blocks.length > 0) ? "0 6px 20px rgba(157,130,255,0.4)" : "none",
//                   transition: "all 0.2s ease",
//                 }}
//               >
//                 {uploadingCount > 0 ? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}…` : "Publish post ✦"}
//               </motion.button>
//             </motion.div>
//           ) : (
//             <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
//               <div style={{ fontSize: 11, fontWeight: 600, color: "#636366", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
//                 How it appears in the feed
//               </div>
//               <ArticlePreview title={title} blocks={blocks} />
//               {blocks.length > 0 && (
//                 <div style={{
//                   marginTop: 12, padding: "10px 14px", borderRadius: 12,
//                   background: "rgba(76,217,123,0.08)", border: "1px solid rgba(76,217,123,0.2)",
//                   fontSize: 12, color: "#4CD97B", letterSpacing: "-0.01em",
//                   display: "flex", alignItems: "center", gap: 6,
//                 }}>
//                   <CheckIcon size={12} />
//                   {blocks.length} blocks · {blocks.filter(b => b.type === "image").length} images · Typography consistent with design system
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }