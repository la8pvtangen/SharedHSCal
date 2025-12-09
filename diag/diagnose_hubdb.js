// diagnose_hubdb.js
import axios from "axios";

// TODO: insert your private app token here or load from env
const HUBSPOT_TOKEN ='pat-eu1-3f4b8ab7-d4d3-4a6d-952a-da076489c8a5';

const TABLES = [
  { name: "Placeholder Config", id: 910065887 },
  { name: "SyncState", id: 910065888 }
];

async function readTableStructure(tableId) {
  const url = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
  });
  return res.data;
}

async function readTableRows(tableId) {
  const url = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}/rows`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
  });
  return res.data.results;
}

function printColumns(def) {
  console.log("  COLUMNS:");
  def.columns.forEach(col => {
    console.log(
      `   - Label: ${col.label.padEnd(20)}  | Name: ${col.name.padEnd(25)} | Type: ${col.type}`
    );
  });
}

function printRows(rows) {
  if (rows.length === 0) {
    console.log("  No rows in table.");
    return;
  }

  console.log("  ROW DATA:");
  rows.forEach(r => {
    console.log("   -----------------------");
    console.log(JSON.stringify(r.values, null, 2));
  });
}

async function main() {
  console.log("=== HUBDB DIAGNOSTICS ===\n");

  for (const t of TABLES) {
    try {
      console.log(`\n>>> TABLE: ${t.name} (ID ${t.id})`);
      
      const tableDef = await readTableStructure(t.id);
      printColumns(tableDef);

      const rows = await readTableRows(t.id);
      printRows(rows);

    } catch (err) {
      console.error("\n[ERROR] Cannot read table:", t.name);
      if (err.response?.data) console.error(err.response.data);
      else console.error(err);
    }
  }

  console.log("\n=== DONE ===");
}

main();
