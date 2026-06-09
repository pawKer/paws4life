import cron from "node-cron";

import { syncShelterPets } from "@/lib/shelter/sync";

const schedule = process.env.SYNC_CRON ?? "0 7 * * *";
const timezone = process.env.SYNC_TIMEZONE ?? "Europe/Bucharest";

let running = false;

async function runSync(label: string) {
  if (running) {
    console.info(`Skipping ${label} sync because another run is active.`);
    return;
  }

  running = true;
  try {
    const summary = await syncShelterPets();
    console.info(`${label} sync finished`, summary);
  } catch (error) {
    console.error(`${label} sync crashed`, error);
  } finally {
    running = false;
  }
}

console.info(`Starting shelter sync cron: ${schedule} (${timezone})`);
void runSync("startup");

cron.schedule(schedule, () => void runSync("scheduled"), {
  timezone,
  noOverlap: true
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
