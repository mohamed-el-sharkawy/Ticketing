import { TicketCreatedEvent } from "@ttiicckkeett/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  
  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10
  }
  
  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener , data , msg };
}

it('creates and saves a ticket', async () => {
  const {listener , data , msg} = await setup();

  // Call the onMessage function with the data event + message object
  await listener.onMessage(data , msg);

  const ticket = await Ticket.findById(data.id);
  // Write assertions to make sure a ticket was created
  
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
})

it('acks the message' , async () => {
  const {listener , data , msg} = await setup();

  // Call the onMessage function with the data event + message object
  await listener.onMessage(data , msg);
  
  // Write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
})