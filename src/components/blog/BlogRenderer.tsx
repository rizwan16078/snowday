import { Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BlogFAQ } from "./BlogFAQ";

interface BlogRendererProps {
  content: string;
}

interface ParsedBlock {
  type: "h2" | "h3" | "table" | "quote" | "list" | "paragraph" | "faq" | "cta";
  raw: string;
  meta?: Record<string, unknown>;
}

// ---- Inline formatting (bold, links, code) ----
function inlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[13px] font-mono">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-white/80">$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-300 font-semibold hover:text-blue-200 transition-colors border-b border-blue-300/30 hover:border-blue-200">$1</a>'
    );
}

// ---- Detect if a block is a markdown table ----
function isTable(block: string): boolean {
  const lines = block.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return false;
  // Second line must be a separator like | --- | --- |
  return /^\|[\s:|-]+\|$/.test(lines[1]?.trim() || "");
}

// ---- Parse content into structured blocks ----
function parseContent(content: string): ParsedBlock[] {
  const lines = content.split("\n");
  const blocks: ParsedBlock[] = [];
  let buffer: string[] = [];

  function flushBuffer() {
    if (buffer.length === 0) return;
    const text = buffer.join("\n").trim();
    if (!text) {
      buffer = [];
      return;
    }
    blocks.push({ type: "paragraph", raw: text });
    buffer = [];
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith("## ")) {
      flushBuffer();
      blocks.push({ type: "h2", raw: trimmed.slice(3).trim() });
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushBuffer();
      blocks.push({ type: "h3", raw: trimmed.slice(4).trim() });
      i++;
      continue;
    }

    // Blockquote (Pro Tip)
    if (trimmed.startsWith("> ")) {
      flushBuffer();
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("> ") || lines[i].trim() === ">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", raw: quoteLines.join("\n") });
      continue;
    }

    // Table
    if (trimmed.startsWith("|")) {
      flushBuffer();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const tableBlock = tableLines.join("\n");
      if (isTable(tableBlock)) {
        blocks.push({ type: "table", raw: tableBlock });
      } else {
        blocks.push({ type: "paragraph", raw: tableBlock });
      }
      continue;
    }

    // List
    if (trimmed.match(/^[-*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      flushBuffer();
      const listLines: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().match(/^[-*]\s+/) || lines[i].trim().match(/^\d+\.\s+/) || lines[i].trim() === "")
      ) {
        if (lines[i].trim() === "") {
          // Look ahead — only break if next line isn't a list item
          const next = lines[i + 1]?.trim() || "";
          if (!next.match(/^[-*]\s+/) && !next.match(/^\d+\.\s+/)) break;
          i++;
          continue;
        }
        listLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "list", raw: listLines.join("\n") });
      continue;
    }

    // Empty line — flush buffer
    if (trimmed === "") {
      flushBuffer();
      i++;
      continue;
    }

    // Otherwise, accumulate as paragraph
    buffer.push(line);
    i++;
  }
  flushBuffer();

  // ---- Second pass: detect FAQ section ----
  // FAQ section starts with H2 "Frequently Asked Questions" and following content is Q/A pairs
  const finalBlocks: ParsedBlock[] = [];
  for (let j = 0; j < blocks.length; j++) {
    const b = blocks[j];
    if (b.type === "h2" && /frequently asked questions|faq/i.test(b.raw)) {
      // Collect FAQ pairs until next H2 or end
      const items: { question: string; answer: string }[] = [];
      let k = j + 1;
      while (k < blocks.length && blocks[k].type !== "h2") {
        const pb = blocks[k];
        if (pb.type === "paragraph") {
          // Match **Question?** \n Answer text
          const m = pb.raw.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
          if (m) {
            items.push({ question: m[1].trim(), answer: m[2].trim() });
          }
        }
        k++;
      }
      if (items.length > 0) {
        finalBlocks.push({ type: "h2", raw: b.raw });
        finalBlocks.push({ type: "faq", raw: "", meta: { items } });
        j = k - 1;
        continue;
      }
    }
    finalBlocks.push(b);
  }

  return finalBlocks;
}

// ---- Render individual blocks ----
function renderBlock(block: ParsedBlock, key: number): React.ReactNode {
  switch (block.type) {
    case "h2": {
      const id = block.raw
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return (
        <h2
          key={key}
          id={id}
          className="text-2xl sm:text-3xl font-display font-black text-white mt-14 mb-5 scroll-mt-24 leading-tight"
        >
          {block.raw}
        </h2>
      );
    }
    case "h3":
      return (
        <h3
          key={key}
          className="text-lg sm:text-xl font-bold text-blue-200 mt-8 mb-3 leading-snug"
        >
          {block.raw}
        </h3>
      );
    case "quote": {
      // Pro Tip / Trench Truth
      const cleaned = block.raw.replace(/^\*\*([^*]+)\*\*\s*/, "").trim();
      const titleMatch = block.raw.match(/^\*\*([^*]+)\*\*/);
      const title = titleMatch ? titleMatch[1] : "Pro Tip";
      return (
        <div
          key={key}
          className="my-8 relative overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-5 sm:p-6"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold mb-2">
                {title}
              </p>
              <p
                className="text-[15px] text-white/85 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: inlineMarkdown(cleaned) }}
              />
            </div>
          </div>
        </div>
      );
    }
    case "table": {
      const lines = block.raw.split("\n").filter((l) => l.trim().startsWith("|"));
      const headerLine = lines[0];
      const bodyLines = lines.slice(2); // skip separator
      const headers = headerLine
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());
      const rows = bodyLines.map((row) =>
        row
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim())
      );

      return (
        <div
          key={key}
          className="my-8 -mx-2 sm:mx-0 overflow-x-auto rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent"
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    className="text-left py-3 px-4 text-[11px] uppercase tracking-[0.15em] text-blue-300 font-bold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-blue-500/[0.04]"
                >
                  {row.map((c, ci) => (
                    <td
                      key={ci}
                      className="py-3 px-4 text-white/75 text-[14px] leading-snug align-top"
                      dangerouslySetInnerHTML={{ __html: inlineMarkdown(c) }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "list": {
      const items = block.raw.split("\n").filter((l) => l.trim());
      const ordered = items[0]?.trim().match(/^\d+\.\s+/);
      return (
        <ul key={key} className="my-5 space-y-2.5">
          {items.map((item, ii) => {
            const cleaned = item.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
            return (
              <li key={ii} className="flex gap-3 text-[15px] text-white/70 leading-relaxed">
                <span className="shrink-0 mt-1.5">
                  {ordered ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                      {ii + 1}
                    </span>
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </span>
                <span
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: inlineMarkdown(cleaned) }}
                />
              </li>
            );
          })}
        </ul>
      );
    }
    case "faq": {
      const items = (block.meta?.items as { question: string; answer: string }[]) || [];
      return <BlogFAQ key={key} items={items} />;
    }
    case "paragraph":
    default:
      return (
        <p
          key={key}
          className="text-white/70 leading-[1.75] text-[16px] my-5"
          dangerouslySetInnerHTML={{ __html: inlineMarkdown(block.raw) }}
        />
      );
  }
}

// ---- Extract H2 headings for Table of Contents ----
export function extractHeadings(content: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("## ") && !t.startsWith("### ")) {
      const text = t.slice(3).trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text });
    }
  }
  return headings;
}

export function extractFAQs(content: string): { question: string; answer: string }[] {
  const blocks = parseContent(content);
  const faqs: { question: string; answer: string }[] = [];
  for (let j = 0; j < blocks.length; j++) {
    const b = blocks[j];
    if (b.type === "h2" && /frequently asked questions|faq/i.test(b.raw)) {
      let k = j + 1;
      while (k < blocks.length && blocks[k].type !== "h2") {
        const pb = blocks[k];
        if (pb.type === "paragraph") {
          const m = pb.raw.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
          if (m) {
            faqs.push({ question: m[1].trim(), answer: m[2].trim() });
          }
        }
        k++;
      }
    }
  }
  return faqs;
}

export function BlogRenderer({ content }: BlogRendererProps) {
  const blocks = parseContent(content);
  return <>{blocks.map((b, i) => renderBlock(b, i))}</>;
}
