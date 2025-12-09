//--------------------------------------------------------------
// Sync Engine – Shared HotSeat Calendar
//--------------------------------------------------------------

import {
    logInfo,
    logDebug,
    logWarn,
    logError
} from "../util/util-logger.js";

import {
    getUserCalendarEvents,
    getSharedCalendarEvents,
    createSharedEvent,
    updateSharedEvent,
    deleteSharedEvent
} from "./graph.js";

import {
    loadSyncState,
    saveSyncState,
    deleteSyncState
} from "./sync-state.js";

import { transformEvent } from "./arc-transform.js";

//--------------------------------------------------------------
// GLOBAL SAFE MODE SWITCH
// true  = DO NOT write to Graph or HubDB
// false = Full sync (create/update/delete)
//--------------------------------------------------------------
export const SAFE_MODE = false;

//--------------------------------------------------------------
// Main sync engine
//--------------------------------------------------------------
export async function runSyncEngine(arcConfig) {

    logInfo("runSyncEngine() started");

    //----------------------------------------------------------
    // Validate config
    //----------------------------------------------------------
    if (!arcConfig || !arcConfig.category) {
        logError("[ENGINE] arcConfig missing required 'category'");
        return;
    }

    logInfo("ARC CONFIG RECEIVED BY ENGINE: " + JSON.stringify(arcConfig));

    //----------------------------------------------------------
    // Load SyncState rows
    //----------------------------------------------------------
    logInfo(`Loading SyncState rows for category '${arcConfig.category}'…`);

    let syncState = [];

    try {
        syncState = await loadSyncState(arcConfig.category);
    } catch (err) {
        logError("FATAL ERROR IN SYNC ENGINE: " + err);
        return;
    }

    //----------------------------------------------------------
    // Fetch user events
    //----------------------------------------------------------
    logInfo("Fetching events from user calendar…");
    const userEvents = await getUserCalendarEvents();
    logInfo(`User events fetched: ${userEvents.length}`);

    //----------------------------------------------------------
    // Fetch shared calendar events
    //----------------------------------------------------------
    logInfo("Fetching events from shared calendar…");
    const sharedEvents = await getSharedCalendarEvents(arcConfig.sharedCalendar);
    logInfo(`Shared events fetched: ${sharedEvents.length}`);

    //--------------------------------------------------------------
    // FILTER USER EVENTS BY CATEGORY
    //--------------------------------------------------------------
    const filteredUserEvents = userEvents.filter(evt =>
        evt.categories &&
        Array.isArray(evt.categories) &&
        evt.categories.includes(arcConfig.category)
    );

    logInfo(
        `Filtered user events for category '${arcConfig.category}': ${filteredUserEvents.length}`
    );

    //--------------------------------------------------------------
    // SAFE MODE LOGGING
    //--------------------------------------------------------------
    if (SAFE_MODE) {
        logWarn("------------------------------------------------------------");
        logWarn(" SAFE MODE ENABLED — NO WRITE OPERATIONS WILL OCCUR");
        logWarn("------------------------------------------------------------");
    } else {
        logInfo("------------------------------------------------------------");
        logInfo(" SAFE MODE DISABLED — FULL SYNC OPERATIONS ACTIVE");
        logInfo("------------------------------------------------------------");
    }

    //--------------------------------------------------------------
    // MAIN SYNC LOOP
    //--------------------------------------------------------------
    for (const event of filteredUserEvents) {

        logDebug("Transforming event: " + JSON.stringify(event));

        const transformed = transformEvent(event, arcConfig);
        logDebug("Transformed event: " + JSON.stringify(transformed));

        const existing = syncState.find(
            s => s.user_event_icaluid === event.iCalUId
        );

        //------------------------------------------------------
        // CREATE
        //------------------------------------------------------
        if (!existing) {
            if (!SAFE_MODE) {
                const sharedId = await createSharedEvent(
                    arcConfig.sharedCalendar,
                    transformed
                );

                logInfo("Created shared event: " + sharedId);

                await saveSyncState({
                    category_key: arcConfig.category,
                    user_event_icaluid: event.iCalUId,
                    shared_event_id: sharedId,
                    shared_calendar_email: arcConfig.sharedCalendar,
                    last_sync_timestamp: new Date().toISOString()
                });

            } else {
                logWarn("SAFE MODE: Skip CREATE");
            }

            continue;
        }

        //------------------------------------------------------
        // UPDATE
        //------------------------------------------------------
        if (!SAFE_MODE) {
            await updateSharedEvent(
                existing.shared_event_id,
                transformed
            );
        } else {
            logWarn("SAFE MODE: Skip UPDATE");
        }
    }

    //--------------------------------------------------------------
    // DELETE logic (only if enabled)
    //--------------------------------------------------------------
    if (arcConfig.deleteEnabled) {

        logInfo("Running deletion phase…");

        for (const row of syncState) {

            const stillExists = filteredUserEvents.some(
                evt => evt.iCalUId === row.user_event_icaluid
            );

            if (!stillExists) {

                logInfo(`[DELETE] User removed event: ${row.user_event_icaluid}`);

                if (!SAFE_MODE) {
                    await deleteSharedEvent(row.shared_event_id);
                    await deleteSyncState(row.id);
                } else {
                    logWarn("SAFE MODE: Skip DELETE");
                }
            }
        }
    }

    logInfo("Engine reached end of pipeline.");
}
