import mongoose from 'mongoose';

interface PaymentAtters {
  orderId: string;
  stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(atters: PaymentAtters): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
    type: String,
    required: true
  }
},{
  toJSON: {
    transform(ret , doc){
      ret.id = ret._id;
      delete ret._id;
    }
  }
})

paymentSchema.statics.build = (atters: PaymentAtters) => {
  return new Payment(atters);
}

const Payment = mongoose.model<PaymentDoc , PaymentModel>('Payment', paymentSchema);
export { Payment };