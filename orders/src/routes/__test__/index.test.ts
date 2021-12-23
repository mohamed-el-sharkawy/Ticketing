import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { fastSignup } from '../../test/fastSignup';
import mongoose from 'mongoose';

it('fetches orders for a particular user' , async () => {
  // Create three tickets
  const ticketOne = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticketOne.save();

  const ticketTwo = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticketTwo.save();

  const ticketThree = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticketThree.save();
  
  const userOne = fastSignup();
  const userTwo = fastSignup();
  
  // Reserve 1 ticket as user #1
  await request(app)
  .post('/api/orders')
  .set('Cookie' , userOne)
  .send({
    ticketId : ticketOne.id
  })
  .expect(201)
  // Reserve 2 tickets as user #2
  const {body : orderOne} = await request(app)
  .post('/api/orders')
  .set('Cookie' , userTwo)
  .send({
    ticketId : ticketTwo.id
  })
  .expect(201);
  
  const {body: orderTwo} = await request(app)
  .post('/api/orders')
  .set('Cookie' , userTwo)
  .send({
    ticketId : ticketThree.id
  })
  .expect(201);
  // Make a request to get the tickets for user #2 
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie' , userTwo)
    .expect(200);

  // Make sure we got the 2 tickets for user #2 
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});