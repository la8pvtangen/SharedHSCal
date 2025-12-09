// ---------------------------------------------------------
// sync-state.js – Load, Save & Delete SyncState rows
// ---------------------------------------------------------

import {
    hubdbGetRows,
    hubdbCreateRow,
    hubdbUpdateRow,
    hubdbDeleteRow
} from "./hubdb.js";

import {
    logInfo,
    logDebug,
    logWarn,
    logError,
    logFatal
} from "../util/util-logger.js";

import { loadConfig } from "./config.js";

// Load .env config
const cfg = loadConfig();

// SyncState HubDB table ID
const SYNCSTATE_TABLE_ID = cfg.HOTSEAT_SYNCSTATE_TABLE_ID;

if (!SYNCSTATE_TABLE_ID) {
    logFatal("Missing HOTSEAT_SYNCSTATE_TABLE_ID in config!");
    process.exit(1);
}

// ---------------------------------------------------------
// Load SyncState entries for a given category
// ---------------------------------------------------------
export async function loadSyncState(category) {
    try {
        logInfo("loadSyncState(): Fetching SyncState rows…");
        logDebug(`HubDB GET: table ${SYNCSTATE_TABLE_ID}`);

        const rows = await hubdbGetRows(SYNCSTATE_TABLE_ID);

        logDebug(`HubDB returned ${rows.length} SyncState rows`);

        const filtered = rows.filter(r => r.category === category);

        logDebug(`Filtered SyncState rows (${filtered.length}):`, filtered);
        return filtered;

    } catch (err) {
        logError("SyncState READ error:", err);
        throw err;
    }
}

// ---------------------------------------------------------
// Save (create) SyncState row
// ---------------------------------------------------------
export async function saveSyncState({ category, userEventId, sharedEventId }) {
    try {
        logInfo("saveSyncState(): Saving SyncState…");

        const payload = {
            category,
            user_event_id: userEventId,
            shared_event_id: sharedEventId
        };

        logDebug("HubDB CREATE payload:", payload);

        const created = await hubdbCreateRow(SYNCSTATE_TABLE_ID, payload);

        logInfo("SyncState saved:", created);
        return created;

    } catch (err) {
        logError("HubDB WRITE error:", err);
        throw err;
    }
}

// ---------------------------------------------------------
// Delete SyncState row (NEW REQUIRED EXPORT)
// ---------------------------------------------------------
export async function deleteSyncState(rowId) {
    try {
        logInfo(`deleteSyncState(): Deleting row ${rowId}…`);
        const deleted = await hubdbDeleteRow(SYNCSTATE_TABLE_ID, rowId);
        logInfo("SyncState row deleted:", deleted);
        return deleted;
    } catch (err) {
        logError("SyncState DELETE error:", err);
        throw err;
    }
}
