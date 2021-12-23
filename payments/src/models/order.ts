import { OrderStatus } from '@ttiicckkeett/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAtters {
  id: string;
  price: number;
  status: OrderStatus;
  version: number;
  userId: string;
}

interface OrderDoc extends mongoose.Document {
  price: number;
  status: OrderStatus;
  version: number;
  userId: string;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(atters: OrderAtters) : OrderDoc;
}

const orderSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus)
  }
},{
  toJSON : {
    transform(doc , ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

orderSchema.set('versionKey' , 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (atters: OrderAtters) => {
  return new Order({
    _id : atters.id,
    version: atters.version,
    price: atters.price,
    userId: atters.userId,
    status: atters.status
  })
}

const Order = mongoose.model<OrderDoc , OrderModel>('Order', orderSchema);

export { Order };