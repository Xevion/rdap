import type { FunctionComponent } from "react";
import React, { useMemo } from "react";
import type { VCardArray } from "@/rdap/schemas";
import { parseVCard } from "@/rdap/contact-parser";
import ContactTable from "@/rdap/components/ContactTable";

export type VCardDisplayProps = {
	vcardArray: VCardArray;
};

/**
 * Display component for vCard (jCard format, RFC 7095) contact cards in RDAP responses.
 * jCard is the JSON representation of vCard 4.0.
 */
const VCardDisplay: FunctionComponent<VCardDisplayProps> = ({ vcardArray }) => {
	const contact = useMemo(() => parseVCard(vcardArray), [vcardArray]);
	return <ContactTable contact={contact} />;
};

export default VCardDisplay;
