import type { FunctionComponent } from "react";
import type { Event } from "@/rdap/schemas";
import DynamicDate from "@/components/DynamicDate";
import EmDash from "@/components/EmDash";
import { Table, Text } from "@radix-ui/themes";

export type EventsProps = {
	data: Event[];
};

const Events: FunctionComponent<EventsProps> = ({ data }) => {
	return (
		<Table.Root size="1" variant="surface" layout="auto">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Event</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell align="right">Actor</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{data.map(({ eventAction, eventDate, eventActor }, index) => (
					<Table.Row key={index}>
						<Table.Cell pr="4">
							<Text size="2">{eventAction}</Text>
						</Table.Cell>
						<Table.Cell pr="4">
							<DynamicDate value={new Date(eventDate)} />
						</Table.Cell>
						<Table.Cell align="right">
							{eventActor ? (
								<Text size="2" color="gray">
									{eventActor}
								</Text>
							) : (
								<EmDash />
							)}
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
};

export default Events;
