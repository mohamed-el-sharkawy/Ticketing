import { Listener, OrderCreatedEvent, Subjects } from "@ttiicckkeett/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
 
export class OrderCreateddListener extends Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data : OrderCreatedEvent['data'] , msg: Message){
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);
    // If no ticket, throw an error
    if(!ticket){
      throw new Error('ticket not found');
    }
    // Mark the ticket as reserved by setting the orderId property
    ticket.set({orderId : data.id});
    // Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    });
    // Ack the message
    msg.ack();
  }
  
}