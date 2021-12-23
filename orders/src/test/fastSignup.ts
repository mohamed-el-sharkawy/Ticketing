import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const fastSignup = function () {
  //  Build a JWT bayload
  // { id: ....  , email: ..... }
  const id = new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id,  email: 'test@test.com'
  };

  // Create the JWT.
  const token = jwt.sign(payload , process.env.JWT_KEY!);

  // Build a session object 
  // { jwt : .... }

  const session = {
    jwt: token
  }

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take the JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string that is the cookie with the encoded data
  return [`express:sess=${base64}`];
};