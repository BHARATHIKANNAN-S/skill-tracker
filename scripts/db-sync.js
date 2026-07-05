const { execSync } = require("child_process");

console.log("Starting DB synchronization...");
try {
  console.log("Running: npx prisma db push...");
  const pushOut = execSync("npx prisma db push", { stdio: "inherit" });
  console.log("Prisma db push completed.");

  console.log("Running: npx prisma generate...");
  const genOut = execSync("npx prisma generate", { stdio: "inherit" });
  console.log("Prisma generate completed.");

  console.log("Running: npx tsx prisma/seed.ts...");
  const seedOut = execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  console.log("Prisma db seed completed successfully!");
} catch (error) {
  console.error("DB Sync failed:");
  if (error.message) console.error(error.message);
  process.exit(1);
}
