import { Publisher, Subjects, TicketCreatedEvent } from '@ttiicckkeett/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}