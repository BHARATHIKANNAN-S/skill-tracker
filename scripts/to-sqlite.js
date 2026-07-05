const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../prisma/schema.prisma");

try {
  let content = fs.readFileSync(schemaPath, "utf-8");

  // Replace provider = "postgresql" with provider = "sqlite"
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  
  fs.writeFileSync(schemaPath, content, "utf-8");
  console.log("Successfully converted prisma/schema.prisma datasource provider to 'sqlite'!");
  console.log("Please make sure your DATABASE_URL in .env points to a local file (e.g. 'file:./dev.db').");
  console.log("Run node scripts/db-sync.js to build the local SQLite database.");
} catch (error) {
  console.error("Failed to convert schema to sqlite:", error);
}
