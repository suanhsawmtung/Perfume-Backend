import { prisma } from "../src/lib/prisma";
import { createCache, removeCache } from "../src/utils/cache";

async function setMaintenanceMode(mode: "on" | "off") {
  try {
    if (mode === "on") {
      await createCache(".maintenance");
    } else {
      removeCache(".maintenance");
    }

    console.log(`✅ Maintenance mode: ${mode.toUpperCase()}`);
  } catch (error) {
    console.error("❌ Error updating maintenance mode:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command from arguments
const command = process.argv[2];

if (command === "down") {
  setMaintenanceMode("on");
} else if (command === "up") {
  setMaintenanceMode("off");
} else {
  console.log("Usage: tsx scripts/maintenance.ts [down|up]");
  console.log("  down - Enable maintenance mode");
  console.log("  up   - Disable maintenance mode");
  process.exit(1);
}
