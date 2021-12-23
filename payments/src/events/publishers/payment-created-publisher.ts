import { PaymentCreatedEvent, Publisher, Subjects } from "@ttiicckkeett/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.paymentCreated;
}