import type {FunctionComponent} from "react";
import type {Event} from "@/responses";
import {Fragment} from "react";

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
                    <span
                        title={eventDate.toString()}>{eventDate.toString()}
                    </span>
                    {eventActor != null ? `(by ${eventActor})` : null}
                </dd>
            </Fragment>
        })}
    </dl>
}

export default Events;