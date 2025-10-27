import fs from "fs";
import { StackClientApp } from "@stackframe/stack";

const CONFIG = {
  PROJECT_ID: process.env.VITE_STACK_PROJECT_ID!,
  SERVER_KEY: process.env.STACK_SECRET_KEY!,
};

const stack = new StackClientApp(CONFIG.PROJECT_ID, CONFIG.SERVER_KEY);
const users = fs.readFileSync("user_data.csv", "utf8").split("\n");

async function migrateUsers() {
  for (const line of users.slice(1)) {
    const [email, password_hash] = line.split(",");
    if (!email) continue;
    try {
      await stack.admin.users.create({
        email,
        passwordHash: password_hash.trim(), // bcrypt hash from Supabase
      });
      console.log(`Migrated user: ${email}`);
    } catch (err) {
      console.error(`Failed to migrate user ${email}:`, err);
    }
  }
  console.log("✅ Migration complete!");
}

migrateUsers().catch(console.error);