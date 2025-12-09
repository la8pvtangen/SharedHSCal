// ---------------------------------------------------------
// config.js – unified configuration loader
// ---------------------------------------------------------

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Resolve absolute directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to env/config.env
const ENV_PATH = path.join(__dirname, "../env/config.env");

console.log("[CONFIG] Loading .env file:", ENV_PATH);

// Load the config file
dotenv.config({ path: ENV_PATH });

// Helper: parse yes/no → boolean
function parseYesNo(value) {
    if (!value) return false;
    return value.toString().trim().toLowerCase() === "yes";
}

// Main loader
export function loadConfig() {

    const cfg = {
        MS_CLIENT_ID: process.env.MS_CLIENT_ID,
        MS_CLIENT_SECRET: process.env.MS_CLIENT_SECRET,
        MS_TENANT_ID: process.env.MS_TENANT_ID,

        NON_HS_USER_EMAIL: process.env.NON_HS_USER_EMAIL,
        SHARED_CALENDAR_EMAIL: process.env.SHARED_CALENDAR_EMAIL,

        HUBSPOT_PRIVATE_APP_TOKEN: process.env.HUBSPOT_PRIVATE_APP_TOKEN,

        HOTSEAT_PLACEHOLDER_TABLE_ID: process.env.HOTSEAT_PLACEHOLDER_TABLE_ID,
        HOTSEAT_SYNCSTATE_TABLE_ID: process.env.HOTSEAT_SYNCSTATE_TABLE_ID,

        // Optional overrides
        ARC_CATEGORY_OVERRIDE: process.env.ARC_CATEGORY_OVERRIDE || null,
        ARC_SYNC_ENABLED_OVERRIDE: parseYesNo(process.env.ARC_SYNC_ENABLED),
    };

    return cfg;
}
