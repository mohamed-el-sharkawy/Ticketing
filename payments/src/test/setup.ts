import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';


jest.mock('../nats-wrapper');

process.env.STRIPE_KEY = 'sk_test_51K8V8wF1q3ZKmhsLRQMV3VKgXRSxaLelarNUeP7a8oXGoYWCA94uXo0Uiuk19F17OKO1DRA4dtNmWVhn77H8cX0R00HXsfZCMW';

let mongo : any;
process.env.JWT_KEY = 'asdfadflaf';

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  
  for (let collection of collections){
    await collection.deleteMany({});
  }
  
});

afterAll( async () => {
  await mongo.stop();
  await mongoose.connection.close();
})

