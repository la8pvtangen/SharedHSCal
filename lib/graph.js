//--------------------------------------------------------------
// graph.js — Microsoft Graph API wrapper
//--------------------------------------------------------------

import axios from "axios";
import { getAccessToken } from "./ms-auth.js";
import { logInfo, logDebug, logError } from "../util/util-logger.js";

//--------------------------------------------------------------
// Internal helper: Build authenticated Axios client
//--------------------------------------------------------------
async function graphClient() {
    const token = await getAccessToken();

    return axios.create({
        baseURL: "https://graph.microsoft.com/v1.0",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
}

//--------------------------------------------------------------
// getUserCalendarEvents(email)
//--------------------------------------------------------------
export async function getUserCalendarEvents(email) {
    try {
        logInfo(`[GRAPH] Fetching user events for ${email}`);

        const client = await graphClient();
        const res = await client.get(`/users/${email}/calendar/events`);

        logInfo(`[GRAPH] User events fetched: ${res.data.value.length}`);
        return res.data.value;

    } catch (err) {
        logError("[GRAPH] Error fetching user events", err);
        throw err;
    }
}

//--------------------------------------------------------------
// getSharedCalendarEvents(email)
//--------------------------------------------------------------
export async function getSharedCalendarEvents(email) {
    try {
        logInfo(`[GRAPH] Fetching shared calendar events for ${email}`);

        const client = await graphClient();
        const res = await client.get(`/users/${email}/calendar/events`);

        logInfo(`[GRAPH] Shared events fetched: ${res.data.value.length}`);
        return res.data.value;

    } catch (err) {
        logError("[GRAPH] Error fetching shared calendar events", err);
        throw err;
    }
}

//--------------------------------------------------------------
// createSharedEvent(email, data)
//--------------------------------------------------------------
export async function createSharedEvent(email, data) {
    try {
        logInfo(`[GRAPH] Creating event in shared calendar ${email}`);
        logDebug("Event payload", data);

        const client = await graphClient();
        const res = await client.post(`/users/${email}/calendar/events`, data);

        logInfo(`[GRAPH] Created shared event: ${res.data.id}`);
        return res.data;

    } catch (err) {
        logError("[GRAPH] Error creating shared event", err);
        throw err;
    }
}

//--------------------------------------------------------------
// updateSharedEvent(email, eventId, data)
//--------------------------------------------------------------
export async function updateSharedEvent(email, eventId, data) {
    try {
        logInfo(`[GRAPH] Updating shared event ${eventId}`);
        logDebug("Update data", data);

        const client = await graphClient();
        await client.patch(`/users/${email}/calendar/events/${eventId}`, data);

        logInfo(`[GRAPH] Updated shared event ${eventId}`);
        return true;

    } catch (err) {
        logError("[GRAPH] Error updating shared event", err);
        throw err;
    }
}

//--------------------------------------------------------------
// deleteSharedEvent(email, eventId)
//--------------------------------------------------------------
export async function deleteSharedEvent(email, eventId) {
    try {
        logInfo(`[GRAPH] Deleting shared event ${eventId}`);

        const client = await graphClient();
        await client.delete(`/users/${email}/calendar/events/${eventId}`);

        logInfo(`[GRAPH] Deleted shared event ${eventId}`);
        return true;

    } catch (err) {
        logError("[GRAPH] Error deleting shared event", err);
        throw err;
    }
}
