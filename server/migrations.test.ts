import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Guards the deployment path rather than the running app. The audit table was
// once defined in a SQL file that sat outside the journal, so `drizzle-kit
// migrate` never created it and a clean deployment lost five tables silently.
// These checks are static, so they run without a database.

const drizzleDir = resolve(process.cwd(), "drizzle");

function journalTags(): string[] {
  const journal = JSON.parse(readFileSync(resolve(drizzleDir, "meta/_journal.json"), "utf8"));
  return journal.entries.map((entry: { tag: string }) => entry.tag);
}

function tablesCreatedByMigrations(): Set<string> {
  const created = new Set<string>();
  for (const tag of journalTags()) {
    const sql = readFileSync(resolve(drizzleDir, `${tag}.sql`), "utf8");
    for (const match of sql.matchAll(/CREATE TABLE\s+`([^`]+)`/gi)) created.add(match[1]);
  }
  return created;
}

function tablesDeclaredBySchema(): Set<string> {
  const schema = readFileSync(resolve(drizzleDir, "schema.ts"), "utf8");
  const declared = new Set<string>();
  for (const match of schema.matchAll(/mysqlTable\(\s*"([^"]+)"/g)) declared.add(match[1]);
  return declared;
}

describe("migrations", () => {
  it("creates every table the schema declares", () => {
    const missing = [...tablesDeclaredBySchema()].filter((t) => !tablesCreatedByMigrations().has(t));
    expect(missing, `tables declared in schema.ts but never created by a migration: ${missing.join(", ")}`)
      .toEqual([]);
  });

  it("declares every table the migrations create", () => {
    const declared = tablesDeclaredBySchema();
    const orphaned = [...tablesCreatedByMigrations()].filter((t) => !declared.has(t));
    expect(orphaned, `tables created by a migration but absent from schema.ts: ${orphaned.join(", ")}`)
      .toEqual([]);
  });

  it("leaves no migration file outside the journal", () => {
    // The original defect: a .sql file that exists, reads convincingly, and is
    // never executed because nothing references it. It sat in a subdirectory
    // drizzle-kit never reads, so this walks the tree rather than one level.
    const journaled = new Set(journalTags().map((tag) => `${tag}.sql`));
    const walk = (dir: string, prefix = ""): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.name === "meta") return [];
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) return walk(resolve(dir, entry.name), rel);
        return entry.name.endsWith(".sql") ? [rel] : [];
      });
    const unreferenced = walk(drizzleDir).filter((f) => !journaled.has(f));
    expect(unreferenced, `SQL files present but not listed in meta/_journal.json: ${unreferenced.join(", ")}`)
      .toEqual([]);
  });

  it("keeps the AI decision audit table in the deployment path", () => {
    // Advisory writes fail closed, so losing this table takes down every
    // advisory flow rather than silently skipping the audit.
    expect(tablesCreatedByMigrations()).toContain("ai_decision_audits");
  });
});
