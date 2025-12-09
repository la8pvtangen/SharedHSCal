//--------------------------------------------------------------
// ms-auth.js
// Handles Microsoft Graph authentication (client_credentials)
//--------------------------------------------------------------

import axios from "axios";
import { loadConfig } from "./config.js";
import { logInfo, logError, logDebug } from "../util/util-logger.js";

//--------------------------------------------------------------
// Internal token cache
//--------------------------------------------------------------
let cachedToken = null;
let tokenExpiresAt = 0;

//--------------------------------------------------------------
// Generate token URL
//--------------------------------------------------------------
const TOKEN_URL = `https://login.microsoftonline.com/${CONFIG.MS_TENANT_ID}/oauth2/v2.0/token`;

//--------------------------------------------------------------
// getAccessToken() – provides a valid Bearer token
//--------------------------------------------------------------
export async function getAccessToken() {
    try {
        const now = Date.now();

        if (cachedToken && now < tokenExpiresAt) {
            logDebug("Using cached Microsoft Graph token");
            return cachedToken;
        }

        logInfo("Requesting new Microsoft Graph access token…");

        const params = new URLSearchParams();
        params.append("client_id", CONFIG.MS_CLIENT_ID);
        params.append("client_secret", CONFIG.MS_CLIENT_SECRET);
        params.append("scope", "https://graph.microsoft.com/.default");
        params.append("grant_type", "client_credentials");

        const res = await axios.post(TOKEN_URL, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        cachedToken = res.data.access_token;

        // expires_in is typically 3600 seconds
        tokenExpiresAt = now + (res.data.expires_in * 1000);

        logDebug("New Microsoft token acquired");
        return cachedToken;

    } catch (err) {
        logError("Failed to acquire Microsoft Graph token", err);
        throw err;
    }
}
