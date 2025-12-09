//---------------------------------------------------------
// HubSpot API Wrapper (using loadConfig() only)
//---------------------------------------------------------

import axios from "axios";
import { loadConfig } from "./config.js";
import { logError } from "../util/util-logger.js";

const BASE = "https://api.hubapi.com";

function auth() {
  const config = loadConfig();
  return { Authorization: `Bearer ${config.HUBSPOT_PRIVATE_APP_TOKEN}` };
}

//---------------------------------------------------------
export async function hubdbGetRows(tableId) {
  try {
    const res = await axios.get(`${BASE}/cms/v3/hubdb/tables/${tableId}/rows`,
      { headers: auth() }
    );
    return res.data.results || [];
  } catch (err) {
    logError("HubDB GET error:", err.response?.data || err);
    throw err;
  }
}

//---------------------------------------------------------
export async function hubdbCreateRow(tableId, values) {
  try {
    const res = await axios.post(`${BASE}/cms/v3/hubdb/tables/${tableId}/rows`,
      { values },
      { headers: auth() }
    );
    return res.data;
  } catch (err) {
    logError("HubDB CREATE error:", err.response?.data || err);
    throw err;
  }
}

//---------------------------------------------------------
export async function hubdbUpdateRow(tableId, rowId, values) {
  try {
    const res = await axios.patch(`${BASE}/cms/v3/hubdb/tables/${tableId}/rows/${rowId}`,
      { values },
      { headers: auth() }
    );
    return res.data;
  } catch (err) {
    logError("HubDB UPDATE error:", err.response?.data || err);
    throw err;
  }
}

//---------------------------------------------------------
export async function hubdbDeleteRow(tableId, rowId) {
  try {
    await axios.delete(`${BASE}/cms/v3/hubdb/tables/${tableId}/rows/${rowId}`,
      { headers: auth() }
    );
  } catch (err) {
    logError("HubDB DELETE error:", err.response?.data || err);
    throw err;
  }
}
