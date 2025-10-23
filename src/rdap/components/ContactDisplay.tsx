import type { FunctionComponent } from "react";
import React from "react";
import type { Entity } from "@/rdap/schemas";
import VCardDisplay from "./VCardDisplay";
import JSContactDisplay from "./JSContactDisplay";

export type ContactDisplayProps = {
	entity: Entity;
};

/**
 * Wrapper component that auto-detects contact format and displays appropriately.
 * Supports both vCard (jCard) and JSContact formats in RDAP responses.
 */
const ContactDisplay: FunctionComponent<ContactDisplayProps> = ({ entity }) => {
	// Check for JSContact format first (preferred modern format)
	if (entity.jscard) {
		return <JSContactDisplay jscard={entity.jscard} />;
	}

	// Fall back to vCard format if available
	if (entity.vcardArray) {
		return <VCardDisplay vcardArray={entity.vcardArray} />;
	}

	// No contact information available
	return null;
};

export default ContactDisplay;
