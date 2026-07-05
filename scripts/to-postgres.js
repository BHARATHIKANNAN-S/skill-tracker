const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");

try {
  let content = fs.readFileSync(schemaPath, "utf-8");

  // Replace provider = "sqlite" with provider = "postgresql"
  content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  
  // Note: On sqlite, we might have autoincrement() or cuid() defaults. 
  // Let's check if the cuid functions or other fields require specific postgres features.
  
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("Successfully converted prisma/schema.prisma datasource provider to 'postgresql'!");
  console.log("Please make sure to set your DATABASE_URL in your .env to a valid PostgreSQL connection string (e.g. from Neon.tech or Supabase).");
  console.log("After setting the env variable, run: node scripts/db-sync.js to apply the schema and seed the database.");
} catch (error) {
  console.error("Failed to convert schema to postgres:", error);
}
