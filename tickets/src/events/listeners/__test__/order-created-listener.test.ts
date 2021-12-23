import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreateddListener } from "../order-created-listener"
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@ttiicckkeett/common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreateddListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  })
  await ticket.save();

  // Create the fake data event
  const data : OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expirseAt: new Date().toUTCString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }
  // @ts-ignore
  const msg : Message = {
    ack: jest.fn()
  }

  return { listener , data , ticket , msg};
}

it('sets the userId of the ticket', async () => {
  const {listener , data , ticket, msg} = await setup();
  
  await listener.onMessage(data , msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
})

it('acks the message', async () => {
  const {listener , data , msg} = await setup();
  
  await listener.onMessage(data , msg);
  expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async () => {
  const { listener , data , msg} = await setup();

  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(ticketUpdatedData.orderId).toEqual(data.id);
})