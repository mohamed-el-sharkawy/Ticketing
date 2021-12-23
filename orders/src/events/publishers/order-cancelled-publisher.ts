import { OrderCancelledEvent, Publisher, Subjects } from "@ttiicckkeett/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
}