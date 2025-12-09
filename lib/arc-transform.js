//--------------------------------------------------------------
// arc-transform.js
// Handles transforming a user calendar event according to ARC rules
//--------------------------------------------------------------

import { logDebug } from "../util/util-logger.js";


//--------------------------------------------------------------
// Transform a user event → shared calendar event
//--------------------------------------------------------------
export function arcTransformEvent(userEvent, arcConfig) {
    if (!userEvent) return null;

    logDebug("Transforming event:", {
        subject: userEvent.subject,
        start: userEvent.start,
        end: userEvent.end
    });

    //----------------------------------------------------------
    // SUBJECT HANDLING
    //----------------------------------------------------------

    let subject = userEvent.subject || "";

    // Optional prefix
    if (arcConfig.subjectPrefix && arcConfig.subjectPrefix !== "") {
        subject = `${arcConfig.subjectPrefix} ${subject}`;
    }

    // Optional static override
    if (arcConfig.subjectStatic && arcConfig.subjectStatic !== "") {
        subject = arcConfig.subjectStatic;
    }

    //----------------------------------------------------------
    // BODY HANDLING
    //----------------------------------------------------------
    const body =
        arcConfig.copyBodyToShared === true && userEvent.bodyPreview
            ? userEvent.bodyPreview
            : "";

    //----------------------------------------------------------
    // LOCATION HANDLING
    //----------------------------------------------------------
    const location =
        arcConfig.copyLocationToShared === true && userEvent.location
            ? userEvent.location.displayName || ""
            : "";

    //----------------------------------------------------------
    // Organizer removal (if required)
    //----------------------------------------------------------
    let attendees = userEvent.attendees || [];
    if (arcConfig.requiresOrganizer === false) {
        attendees = [];
    }

    //----------------------------------------------------------
    // Construct transformed event object for Graph createEvent()
    //----------------------------------------------------------
    const transformedEvent = {
        subject,
        body: {
            contentType: "HTML",
            content: body
        },
        start: userEvent.start,
        end: userEvent.end,
        location: {
            displayName: location
        },
        attendees
    };

    logDebug("Transformed event:", transformedEvent);
    return transformedEvent;
}
