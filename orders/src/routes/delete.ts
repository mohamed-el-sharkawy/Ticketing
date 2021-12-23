import express , { Request , Response } from 'express';
import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth , validateRequest } from '@ttiicckkeett/common';
import mongoose from 'mongoose';
import { param } from 'express-validator';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth
, [
  param('orderId')
  .not()
  .isEmpty()
  .custom((inputId: string) => mongoose.Types.ObjectId.isValid(inputId))
  .withMessage('orderId must be provided')
]
, validateRequest , async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId != req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  // publishing an event saying that the order is cancelled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id
    }
  })

  res.status(204).send(order);

});

export { router as deleteOrderRouter };