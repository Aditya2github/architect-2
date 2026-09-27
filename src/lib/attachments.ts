// Reads files in the browser (nothing is uploaded) and describes what Architect found.

export type Attachment = {
  name: string;
  size: number;
  kind: "table" | "knowledge";
  summary: string;
  columns?: string[];
  rows?: number;
};

const MAX_BYTES = 5 * 1024 * 1024;

function splitCsvLine(line: string, sep: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === sep && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export async function readAttachment(file: File): Promise<Attachment> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["csv", "tsv"].includes(ext) && file.size <= MAX_BYTES) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const sep = ext === "tsv" || (lines[0]?.split("\t").length ?? 0) > (lines[0]?.split(",").length ?? 0) ? "\t" : ",";
    const columns = splitCsvLine(lines[0] ?? "", sep).map((c) => c.replace(/^"|"$/g, "")).filter(Boolean).slice(0, 40);
    const rows = Math.max(lines.length - 1, 0);
    return { name: file.name, size: file.size, kind: "table", columns, rows, summary: `${rows.toLocaleString("en-US")} rows · ${columns.length} columns → loaded as a table agents can query` };
  }
  if (["xlsx", "xls"].includes(ext)) {
    return { name: file.name, size: file.size, kind: "table", summary: `Spreadsheet · ${formatBytes(file.size)} → loaded as a table agents can query` };
  }
  if (["txt", "md"].includes(ext) && file.size <= MAX_BYTES) {
    const words = (await file.text()).split(/\s+/).filter(Boolean).length;
    return { name: file.name, size: file.size, kind: "knowledge", summary: `${words.toLocaleString("en-US")} words → added to the knowledge base, searchable with citations` };
  }
  return { name: file.name, size: file.size, kind: "knowledge", summary: `${ext.toUpperCase() || "File"} · ${formatBytes(file.size)} → added to the knowledge base, searchable with citations` };
}

/** Agent ideas from what's actually in a table's columns. */
export function ideasFromColumns(name: string, columns: string[]): string[] {
  const cols = columns.map((c) => c.toLowerCase());
  const has = (...keys: string[]) => cols.some((c) => keys.some((k) => c.includes(k)));
  const thing = name.replace(/\.(csv|tsv|xlsx?)$/i, "").replace(/[_-]+/g, " ").trim() || "record";
  const one = thing.replace(/s$/i, "");
  const ideas: string[] = [];
  if (has("amount", "total", "price", "value", "cost")) ideas.push(`Flag ${thing} with unusual amounts and explain why each one stands out`);
  if (has("email", "contact", "phone")) ideas.push(`Draft a personal follow-up for each ${one} contact and queue it for my approval`);
  if (has("status", "stage", "state")) ideas.push(`Route each ${one} to the right owner based on its status, and chase anything stuck`);
  if (has("date", "created", "time", "due")) ideas.push(`Send a weekly summary of new and overdue ${thing} to Slack`);
  if (has("description", "notes", "comment", "text", "body")) ideas.push(`Read the notes on each ${one}, tag the topic and sentiment, and surface urgent ones`);
  if (ideas.length === 0) ideas.push(`Answer questions about ${thing} in plain English, with charts`, `Spot duplicates and missing fields in ${thing} and suggest fixes`);
  return ideas.slice(0, 3);
}
