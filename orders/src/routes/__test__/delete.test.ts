import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { fastSignup } from '../../test/fastSignup';
import { Order , OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled' , async () => {
  // Create a ticket with Ticket model

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save();
  
  const user = fastSignup();
  // Make a request to create an order
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId : ticket.id })
    .expect(201);

  // Make a request to cancel the order
  
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie' , user)
    .send()
    .expect(204);

  // Epectation to make sure the order is cancelled

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emits an event to say that the order was cancelled' , async () => {
    // Create a ticket with Ticket model

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save();
    
    const user = fastSignup();
    // Make a request to create an order
    const {body: order} = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId : ticket.id })
      .expect(201);
  
    // Make a request to cancel the order
    
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie' , user)
      .send()
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});