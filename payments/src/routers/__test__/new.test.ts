import { OrderStatus } from '@ttiicckkeett/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { fastSignup } from '../../test/fastSignup';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment'

it('returns a 404 when trying to pay for order which does not exist' , async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie' , fastSignup())
    .send({
      token: 'asdf',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order the does not belong to the user' , async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie' , fastSignup())
  .send({
    token: 'asdf',
    orderId: order.id
  })
  .expect(401);
});

it('returns a 400 when purchasing a cancelled order' , async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Cancelled,
    price: 10,
    userId
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie' , fastSignup(userId))
  .send({
    token: 'asdf',
    orderId: order.id
  })
  .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price,
    userId
  });
  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie' , fastSignup(userId))
  .send({
    token: 'tok_visa',
    orderId: order.id
  })
  .expect(201);

  const stripeCharges = await stripe.charges.list({ limit : 50});
  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  const payment = await Payment.find({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });
  expect(payment).not.toBeNull();
});