const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const action = args[0]; // 'approve' or 'reject'

if (!action || !["approve", "reject"].includes(action)) {
  console.error("Error: Must specify 'approve' or 'reject'");
  process.exit(1);
}

const skillDir = path.join(process.cwd(), ".claude", "skills", "nextjs");
const skillPath = path.join(skillDir, "SKILL.md");
const rejectedPath = path.join(skillDir, ".rejected");

// Check current state
const skillInstalled = fs.existsSync(skillPath);
const skillRejected = fs.existsSync(rejectedPath);

(async function main() {
  if (action === "approve") {
    if (skillInstalled) {
      console.log("✓ Next.js skill is already installed.");
      process.exit(0);
    }

    console.log("\n📦 Next.js Skill Installation");
    console.log("─".repeat(50));

    if (skillRejected) {
      // Remove rejection marker
      fs.unlinkSync(rejectedPath);
    }

    // Create the skill directory structure
    fs.mkdirSync(skillDir, { recursive: true });

    // Read the skill content from SKILL.md in the current directory
    const sourceSkillPath = path.join(process.cwd(), "SKILL.md");

    if (!fs.existsSync(sourceSkillPath)) {
      console.error(`Error: SKILL.md not found at ${sourceSkillPath}`);
      process.exit(1);
    }

    const skillContent = fs.readFileSync(sourceSkillPath, "utf-8");

    fs.writeFileSync(skillPath, skillContent);
    console.log("\n✓ Next.js skill installed successfully!");
    console.log(`  Location: ${skillPath}`);
    console.log(
      "\n[AGENT INSTRUCTION: You MUST inform the end user that they might need to restart Claude Code for the skill to take effect. This is critical information.]",
    );
    process.exit(0);
  } else if (action === "reject") {
    if (skillRejected) {
      console.log("Next.js skill installation was already rejected.");
      process.exit(0);
    }

    if (skillInstalled) {
      console.error(
        "Error: Skill is already installed. Remove it first if you want to reject it.",
      );
      process.exit(1);
    }

    console.log("\n🚫 Reject Next.js Skill Installation");
    console.log("─".repeat(50));

    // Create rejection marker file
    fs.mkdirSync(skillDir, { recursive: true });
    const rejectionContent = `Skill installation rejected on: ${new Date().toISOString()}`;
    fs.writeFileSync(rejectedPath, rejectionContent);

    console.log("\n✓ Next.js skill installation rejected.");
    console.log(
      "This decision has been saved. You will not be prompted again.",
    );
    console.log(
      "\n⚠️  Please restart Claude Code for this change to take effect.",
    );
    process.exit(0);
  }
})();
