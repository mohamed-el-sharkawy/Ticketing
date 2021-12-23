import express, {Request , Response} from "express";
import { body } from "express-validator";
import jwt from 'jsonwebtoken';
import { BadRequestError ,validateRequest} from "@ttiicckkeett/common";
import { User } from "../models/User";

const router = express.Router();

router.post('/api/users/signup' , [
  body('email')
    .isEmail()
    .withMessage('email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 4 , max: 20})
    .withMessage('password must be between 2 and 20 charaters')
], validateRequest , 
async (req : Request, res : Response) => {
  
  const { email , password} = req.body;

  const existingUser = await User.findOne({email});

  if (existingUser){
    throw new BadRequestError('email in use');
  }
  
  const user = User.build({
    email , password
  })
  await user.save();

  const userJWT = jwt.sign({
      id: user.id,
      email: user.email
    },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt : userJWT
  };

  res.status(201).send(user);
});

export {router as signupRouter};

