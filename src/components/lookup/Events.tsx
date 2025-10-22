import type { FunctionComponent } from "react";
import type { Event } from "@/types";
import DynamicDate from "@/components/common/DynamicDate";
import { Table, Text } from "@radix-ui/themes";

export type EventsProps = {
	data: Event[];
};

const Events: FunctionComponent<EventsProps> = ({ data }) => {
	return (
		<Table.Root size="1" variant="surface">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Event</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Actor</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{data.map(({ eventAction, eventDate, eventActor }, index) => (
					<Table.Row key={index}>
						<Table.Cell>
							<Text size="2" weight="medium">
								{eventAction}
							</Text>
						</Table.Cell>
						<Table.Cell>
							<DynamicDate value={new Date(eventDate)} />
						</Table.Cell>
						<Table.Cell>
							<Text size="2" color="gray">
								{eventActor ?? "—"}
							</Text>
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
};

export default Events;
