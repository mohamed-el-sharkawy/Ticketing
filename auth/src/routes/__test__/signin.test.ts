import request from 'supertest';
import { app } from '../../app';
import { fastSignup } from '../../test/fastSignup';

it('fails whrn an email does not exist is supplied', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
     email: 'test@test.com',
     password: 'password'
  })
  .expect(400);
})

it('filas when an incorrect password is supplied' , async () => {
  await fastSignup();

  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'not_true'
  })
  .expect(400);
})

it('response with a cookie when given a validd credentials' , async () => {
  await fastSignup();

  const response = await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'password'
  })
  .expect(201);
  
  expect(response.get('Set-Cookie')).toBeDefined();
})
