//--------------------------------------------------------------
// stage_3.js
// Main entry point for HotSeat Sync (Stage 4 ARC Version)
//--------------------------------------------------------------

import { loadConfig } from "./lib/config.js";
import { loadARCConfig } from "./lib/arc-config.js";
import { runSyncEngine } from "./lib/sync-engine.js";
import { logInfo, logFatal } from "./util/util-logger.js";

async function main() {
    try {
        logInfo("=== HOTSEAT SYNC START ===");

        //--------------------------------------------------------------
        // Load .env configuration (global environment values)
        //--------------------------------------------------------------
        const config = loadConfig();
        console.log("DEBUG CONFIG:", config);

        //--------------------------------------------------------------
        // Load ARC category configuration from HubDB
        //--------------------------------------------------------------
        const arc = await loadARCConfig(config);

        console.log("DEBUG ARC FULL OBJECT:", arc);
        console.log("DEBUG CHECK arc.category:", arc.category);
        console.log("DEBUG CHECK arc.sharedCalendar:", arc.sharedCalendar);
        console.log("DEBUG CHECK arc.syncEnabled:", arc.syncEnabled);

        logInfo("ARC configuration loaded.");

        //--------------------------------------------------------------
        // Run Sync Engine using:
        //   config = global (.env)
        //   arc    = category config from HubDB (business category etc.)
        //--------------------------------------------------------------
        await runSyncEngine(config, arc);

    } catch (err) {
        logFatal("FATAL ERROR:", err);
        process.exit(1);
    }
}

main();
