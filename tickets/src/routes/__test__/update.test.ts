import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { fastSignup } from '../../test/fastSignup';
import { cookie } from 'express-validator';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if the provided id is not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', fastSignup())
    .send({
      title: 'asdf',
      price: 20
    })
    .expect(404);
})

it('returns a 401 if the user is not authenticated' , async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'asdf',
      price: 20
    })
    .expect(401);
})

it('returns a 401 if the user does not own the ticket' , async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie' , fastSignup())
      .send({
        title: 'another_title',
        price: 20
      })
      .expect(401);
})

it('returns a 400 if the user privides an invalid title or price' , async () => {
  const cookie = fastSignup();
  
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie' , cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie' , cookie)
    .send({
      title: 'title',
      price: -1
    })
    .expect(400);
})

it('updates the ticket provided valid inputs' , async () => {
  const cookie = fastSignup();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie' , cookie)
  .send({
    title: 'title',
    price: 10
  })
  .expect(201);

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie' , cookie)
  .send({
    title: 'new_title',
    price: 100
  })
  .expect(200);

  const ticket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set('Cookie' , cookie)
    .send();

  expect(ticket.body.title).toEqual('new_title');
  expect(ticket.body.price).toEqual(100);
  
})

it('publishes an event' , async () => {
  const cookie = fastSignup();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie' , cookie)
  .send({
    title: 'title',
    price: 10
  })
  .expect(201);

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie' , cookie)
  .send({
    title: 'new_title',
    price: 100
  })
  .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if the ticket is reserved' , async () => {
  const cookie = fastSignup();
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie' , cookie)
  .send({
    title: 'title',
    price: 10
  })
  .expect(201);
  
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({orderId}); 
  await ticket!.save();
  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie' , cookie)
  .send({
    title: 'new_title',
    price: 100
  })
  .expect(400);
})