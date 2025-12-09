//--------------------------------------------------------------
// arc-config.js (FIXED)
//--------------------------------------------------------------

import { hubdbGetRows } from "./hubdb.js";
import { logInfo, logDebug, logError } from "../util/util-logger.js";

const HOTSEAT_PLACEHOLDER_TABLE_ID = "910065887";

//--------------------------------------------------------------
// Convert HubDB SELECT option → boolean
//--------------------------------------------------------------
function mapSelectToBool(selectObj) {
    if (!selectObj) return false;
    return selectObj.name === "true";
}

//--------------------------------------------------------------
// Map HubDB row.values → ARC config
//--------------------------------------------------------------
function mapRowToARC(row) {

    //----------------------------------------------------------
    // HubDB rows store all actual fields under row.values
    //----------------------------------------------------------
    const v = row.values || {};

    logDebug("MAPPED ARC CONFIG (raw values):", v);

    return {
        category: v.category || v.category_key || "",
        sharedCalendar: v.shared_calendar || "",
        syncEnabled: mapSelectToBool(v.sync_enabled),
        deleteEnabled: mapSelectToBool(v.delete_enabled),
        subjectPrefix: v.subject_prefix || "",
        subjectStatic: v.subject_static_override || "",
        copyBodyToShared: mapSelectToBool(v.copy_body_to_shared),
        copyLocationToShared: mapSelectToBool(v.copy_location_to_shared),
        includeName: mapSelectToBool(v.subject_include_name),
        requiresOrganizer: mapSelectToBool(v.requires_organizer_name),
        version: v.version || 1,
        note: v.note || ""
    };
}

//--------------------------------------------------------------
// Load ARC config from HubDB
//--------------------------------------------------------------
export async function loadARCConfig(globalConfig) {
    logInfo("Reading HotSeat Placeholder Config…");

    try {
        const rows = await hubdbGetRows(HOTSEAT_PLACEHOLDER_TABLE_ID);

        if (!rows || rows.length === 0) {
            throw new Error("HotSeat placeholder config table is empty.");
        }

        const row = rows[0];

        logDebug("RAW HUBDB CONFIG ROW:", row);

        const arc = mapRowToARC(row);

        logDebug("MAPPED ARC CONFIG:", arc);

        return arc;

    } catch (err) {
        logError("Failed to load ARC config:", err);
        throw err;
    }
}
