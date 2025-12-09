//---------------------------------------------------------
// Utility logger for consistent formatted output
// Provides: logInfo, logWarn, logError, logFatal, logDebug
// Used by ALL modules
//---------------------------------------------------------

export function logInfo(...msg) {
  console.log("[INFO]", ...msg);
}

export function logWarn(...msg) {
  console.warn("[WARN]", ...msg);
}

export function logError(...msg) {
  console.error("[ERROR]", ...msg);
}

export function logFatal(...msg) {
  console.error("[FATAL]", ...msg);
  process.exit(1);
}

export function logDebug(...msg) {
  console.log("[DEBUG]", ...msg);
}
