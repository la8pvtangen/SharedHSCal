// --------------------------------------------------------------
// hubdb.js - Standardized HubDB API Module (Option A)
// --------------------------------------------------------------

import axios from "axios";
import { logInfo, logDebug, logError, logFatal } from "../util/util-logger.js";
import { loadConfig } from "./config.js";

// --------------------------------------------------------------
// Load environment configuration
// --------------------------------------------------------------
const CONFIG = loadConfig();

if (!CONFIG.HUBSPOT_PRIVATE_APP_TOKEN) {
    logFatal("Missing HUBSPOT_PRIVATE_APP_TOKEN in config!");
    throw new Error("Missing HUBSPOT_PRIVATE_APP_TOKEN");
}

// --------------------------------------------------------------
// Shared HubSpot API client
// --------------------------------------------------------------
const HUBSPOT_BASE = "https://api.hubapi.com";

const HS = axios.create({
    baseURL: HUBSPOT_BASE,
    headers: {
        Authorization: `Bearer ${CONFIG.HUBSPOT_PRIVATE_APP_TOKEN}`,
        "Content-Type": "application/json"
    },
    timeout: 15000
});

// --------------------------------------------------------------
// HELPER: Safe HubDB GET wrapper
// --------------------------------------------------------------
async function safeHubDBGet(url, label) {
    try {
        logInfo(`HubDB GET: ${url}`);
        const response = await HS.get(url);
        return response.data;
    } catch (err) {
        logError(`HubDB GET error (${label}):`, err.response?.data || err);
        throw err;
    }
}

// --------------------------------------------------------------
// HELPER: Safe HubDB WRITE wrapper
// --------------------------------------------------------------
async function safeHubDBWrite(method, url, payload, label) {
    try {
        logDebug(`HubDB ${method.toUpperCase()} ${url}`);
        logDebug("Payload:", payload);
        const response = await HS({
            method,
            url,
            data: payload
        });
        return response.data;
    } catch (err) {
        logError(`HubDB WRITE error (${label}):`, err.response?.data || err);
        throw err;
    }
}

// --------------------------------------------------------------
// Get FULL table schema + rows
// --------------------------------------------------------------
export async function hubdbGetTable(tableId) {
    return safeHubDBGet(`/cms/v3/hubdb/tables/${tableId}?includeDetails=true`, "getTable");
}

// --------------------------------------------------------------
// Get ONLY table rows
// --------------------------------------------------------------
export async function hubdbGetRows(tableId) {
    const data = await safeHubDBGet(`/cms/v3/hubdb/tables/${tableId}/rows`, "getRows");
    logDebug(`HubDB ROW COUNT for table ${tableId}: ${data?.results?.length || 0}`);
    return data.results || [];
}

// --------------------------------------------------------------
// CREATE a new HubDB row
// --------------------------------------------------------------
export async function hubdbCreateRow(tableId, values) {
    const payload = { values };
    return safeHubDBWrite(
        "post",
        `/cms/v3/hubdb/tables/${tableId}/rows`,
        payload,
        "createRow"
    );
}

// --------------------------------------------------------------
// UPDATE existing HubDB row
// --------------------------------------------------------------
export async function hubdbUpdateRow(tableId, rowId, values) {
    const payload = { values };
    return safeHubDBWrite(
        "patch",
        `/cms/v3/hubdb/tables/${tableId}/rows/${rowId}`,
        payload,
        "updateRow"
    );
}

// --------------------------------------------------------------
// DELETE a HubDB row
// --------------------------------------------------------------
export async function hubdbDeleteRow(tableId, rowId) {
    return safeHubDBWrite(
        "delete",
        `/cms/v3/hubdb/tables/${tableId}/rows/${rowId}`,
        null,
        "deleteRow"
    );
}

