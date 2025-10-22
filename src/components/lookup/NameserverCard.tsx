import type { FunctionComponent } from "react";
import React from "react";
import type { Nameserver } from "@/types";
import Property from "@/components/common/Property";
import AbstractCard from "@/components/common/AbstractCard";

export type NameserverCardProps = {
	data: Nameserver;
	url?: string;
};

const NameserverCard: FunctionComponent<NameserverCardProps> = ({
	data,
	url,
}: NameserverCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<>
					<span className="font-mono tracking-tighter">NAMESERVER</span>
					<span className="font-mono tracking-wide">{data.ldhName}</span>
				</>
			}
		>
			<dl>
				<Property title="LDH Name">{data.ldhName}</Property>
			</dl>
		</AbstractCard>
	);
};

export default NameserverCard;
