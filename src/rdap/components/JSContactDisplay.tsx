import type { FunctionComponent } from "react";
import React, { useMemo } from "react";
import type { JSCard } from "@/rdap/schemas";
import { parseJSContact } from "@/rdap/contact-parser";
import ContactTable from "@/rdap/components/ContactTable";

export type JSContactDisplayProps = {
	jscard: JSCard;
};

/**
 * Display component for JSContact (RFC 9553) contact cards in RDAP responses.
 * JSContact is a JSON-native alternative to vCard/jCard.
 */
const JSContactDisplay: FunctionComponent<JSContactDisplayProps> = ({ jscard }) => {
	const contact = useMemo(() => parseJSContact(jscard), [jscard]);
	return <ContactTable contact={contact} />;
};

export default JSContactDisplay;
