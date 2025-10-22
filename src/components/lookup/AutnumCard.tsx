import type { FunctionComponent } from "react";
import React from "react";
import type { AutonomousNumber } from "@/types";
import Events from "@/components/lookup/Events";
import Property from "@/components/common/Property";
import PropertyList from "@/components/common/PropertyList";
import AbstractCard from "@/components/common/AbstractCard";

export type AutnumCardProps = {
	data: AutonomousNumber;
	url?: string;
};

const AutnumCard: FunctionComponent<AutnumCardProps> = ({ data, url }: AutnumCardProps) => {
	const asnRange =
		data.startAutnum === data.endAutnum
			? `AS${data.startAutnum}`
			: `AS${data.startAutnum}-AS${data.endAutnum}`;

	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<>
					<span className="font-mono tracking-tighter">AUTONOMOUS SYSTEM</span>
					<span className="font-mono tracking-wide">{asnRange}</span>
					<span className="whitespace-nowrap">({data.handle})</span>
				</>
			}
		>
			<dl>
				<Property title="Name">{data.name}</Property>
				<Property title="Handle">{data.handle}</Property>
				<Property title="ASN Range">
					{data.startAutnum === data.endAutnum
						? `AS${data.startAutnum}`
						: `AS${data.startAutnum} - AS${data.endAutnum}`}
				</Property>
				<Property title="Type">{data.type}</Property>
				<Property title="Country">{data.country.toUpperCase()}</Property>
				<Property title="Events">
					<Events key={0} data={data.events} />
				</Property>
				<PropertyList title="Status">
					{data.status.map((status, index) => (
						<PropertyList.Item key={index} title={status}>
							{status}
						</PropertyList.Item>
					))}
				</PropertyList>
			</dl>
		</AbstractCard>
	);
};

export default AutnumCard;
