import { ExpirationCompleteEvent, Publisher, Subjects } from "@ttiicckkeett/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;
  
}