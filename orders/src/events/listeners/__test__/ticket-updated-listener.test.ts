import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from '@ttiicckkeett/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10
  })

  await ticket.save();

  const data : TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'title',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener , msg , data , ticket };
}

it('finds , updates and saves a ticket', async () => {
  const {listener , msg , data , ticket} = await setup();

  await listener.onMessage(data , msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.version).toEqual(data.version);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.title).toEqual(data.title);
})

it('acks the message' , async () => {
  const {listener , msg , data , ticket} = await setup();

  await listener.onMessage(data , msg);

  expect(msg.ack).toHaveBeenCalled();
})

it('does not call the ack function if the event is out of order', async () => {
  const {listener , msg , data , ticket} = await setup();

  data.version = 10;  

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
})