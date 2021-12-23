import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { fastSignup } from '../../test/fastSignup';
import mongoose from 'mongoose';

it('fetches the order' , async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();
  
  const user = fastSignup();
  // Make a request to order that ticket
  const {body : order} = await request(app)
  .post('/api/orders')
  .set('Cookie' , user)
  .send({
    ticketId : ticket.id
  })
  .expect(201)

  // Make a request to fetch the order
  
  const {body : fetchedOrder} = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order' , async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();
  
  const user = fastSignup();
  // Make a request to order that ticket
  const {body : order} = await request(app)
  .post('/api/orders')
  .set('Cookie' , user)
  .send({
    ticketId : ticket.id
  })
  .expect(201)

  // Make a request to fetch the order
  const user2 = fastSignup();
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user2)
    .send()
    .expect(401);

});