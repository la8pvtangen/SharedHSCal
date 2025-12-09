//--------------------------------------------------------------
// arc-category.js — Determine active HotSeat category
//--------------------------------------------------------------

import { loadConfig } from "./config.js";

export function determineCategory(arc) {
    const override = loadConfig().arcCategoryOverride;

    if (override && arc.hotseat[override]) {
        return override;
    }

    const cats = Object.keys(arc.hotseat);
    return cats.length ? cats[0] : null;
}
