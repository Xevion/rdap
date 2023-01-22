import type {FunctionComponent} from "react";
import type {Event} from "@/types";
import {Fragment} from "react";
import DynamicDate from "@/components/DynamicDate";

export type EventsProps = {
    data: Event[];
}
const Events: FunctionComponent<EventsProps> = ({data}) => {
    return <dl>
        {data.map(({eventAction, eventDate, eventActor}, index) => {
            return <Fragment key={index}>
                <dt className="font-weight-bolder">
                    {eventAction}:
                </dt>
                <dd>
                    <DynamicDate value={new Date(eventDate)}/>
                    {eventActor != null ? ` (by ${eventActor})` : null}
                </dd>
            </Fragment>
        })}
    </dl>
}

export default Events;