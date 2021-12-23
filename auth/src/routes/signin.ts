import express , {Request , Response} from "express";
import { body } from 'express-validator';
import { BadRequestError , validateRequest } from "@ttiicckkeett/common";
import { User } from "../models/User";
import { Password } from "../services/password";
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/api/users/signin' ,
[
  body('email')
  .isEmail()
  .withMessage('Email must be valid'),
  body('password')
  .trim()
  .notEmpty()
  .withMessage('you must add a password')
 ] , validateRequest, 
 async (req : Request, res : Response) => {
  const {email , password} = req.body;

  const existingUser = await User.findOne({ email });

  if(!existingUser){
    throw new BadRequestError('invalid credentails');
  }

  const passwordsMatch = await Password.compare(existingUser.password , password);

  if(!passwordsMatch){
    throw new BadRequestError('invalid credentails');
  }

  const userJWT = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  },
  process.env.JWT_KEY!
  );

  req.session = {
    jwt : userJWT
  };

  res.status(201).send(existingUser);
});

export {router as signinRouter};

