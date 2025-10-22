import type { FunctionComponent } from "react";
import React from "react";
import type { Entity } from "@/types";
import Property from "@/components/common/Property";
import PropertyList from "@/components/common/PropertyList";
import AbstractCard from "@/components/common/AbstractCard";

export type EntityCardProps = {
	data: Entity;
	url?: string;
};

const EntityCard: FunctionComponent<EntityCardProps> = ({ data, url }: EntityCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<>
					<span className="font-mono tracking-tighter">ENTITY</span>
					<span className="font-mono tracking-wide">
						{data.handle || data.roles.join(", ")}
					</span>
				</>
			}
		>
			<dl>
				{data.handle && <Property title="Handle">{data.handle}</Property>}
				<PropertyList title="Roles">
					{data.roles.map((role, index) => (
						<PropertyList.Item key={index} title={role}>
							{role}
						</PropertyList.Item>
					))}
				</PropertyList>
				{data.publicIds && data.publicIds.length > 0 && (
					<PropertyList title="Public IDs">
						{data.publicIds.map((publicId, index) => (
							<PropertyList.Item key={index} title={publicId.type}>
								{`${publicId.identifier} (${publicId.type})`}
							</PropertyList.Item>
						))}
					</PropertyList>
				)}
			</dl>
		</AbstractCard>
	);
};

export default EntityCard;
