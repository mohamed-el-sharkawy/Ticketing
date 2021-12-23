import { OrderCreatedEvent, Publisher, Subjects } from "@ttiicckkeett/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;
}