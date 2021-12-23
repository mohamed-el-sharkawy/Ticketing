import { app } from "../../app";
import request from 'supertest';
import { fastSignup } from "../../test/fastSignup";

it('can fetch a list of tickets', async () => {
  for(let i=0;i<3;i++){
    await request(app)
      .post('/api/tickets')
      .set('Cookie' , fastSignup())
      .send({
        title: 'title1',
        price: 20
      });
  }

  const response = await request(app)
    .get('/api/tickets')
    .set('Cookie' , fastSignup())
    .send()
    .expect(200);
  
  expect(response.body.length).toEqual(3);
});