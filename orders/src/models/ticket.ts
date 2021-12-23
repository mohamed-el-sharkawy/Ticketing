import mongoose from 'mongoose';
import { Order , OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAtters {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document{
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
  build(atters : TicketAtters): TicketDoc;
  findByEvent(event: {id: string , version: number}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
},{
  toJSON:{
    transform(doc , ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchema.statics.findByEvent = (event: { id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
}

ticketSchema.statics.build = (atters : TicketAtters) => {
  return new Ticket({
    _id: atters.id,
    title: atters.title,
    price: atters.price
  });
}

ticketSchema.set('versionKey' , 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document calls the isReserved function
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment
      ]
    }
  });

  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc , TicketModel>('Ticket' , ticketSchema);

export { Ticket }