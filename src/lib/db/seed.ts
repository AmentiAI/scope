/**
 * Database seed script
 * Run with: npx tsx src/lib/db/seed.ts
 */

async function seed() {
  console.log("🌱 Database ready — no seeds required at this time.");
  console.log("   When you need seed data, add it here.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
