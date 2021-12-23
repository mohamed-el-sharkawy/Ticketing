import request from 'supertest';
import { app } from '../../app';
import { fastSignup } from '../../test/fastSignup';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests',async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});

  expect(response.status).not.toEqual(404);
});


it('can only be accessed if the user is signed in',async () => {
  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is signed in',async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided',async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title: '',
      price: 10    
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      price: 10
    })
    .expect(400);
});

it('returns an error if an invalid price is provided',async () => {
  
  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title: 'asdf',
      price: -10    
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title: 'asdf'
    })
    .expect(400);
});

it('creates a ticket with valid inputs',async () => {
  let ticketsCounter = await Ticket.find({}).count();
  expect(ticketsCounter).toEqual(0);
  
  const title = 'asdf';
  const price = 20;

  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title,
      price
    })
    .expect(201);

    ticketsCounter = await Ticket.find({}).count();
    const tickets = await Ticket.find({});
    expect(ticketsCounter).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});

it('publishes an event' , async () => {
  const title = 'asdf';
  const price = 20;

  await request(app)
    .post('/api/tickets')
    .set('Cookie' , fastSignup())
    .send({
      title,
      price
    })
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  
})