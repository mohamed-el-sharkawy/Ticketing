import { useEffect , useState } from "react";
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = ({ order , currentUser }) => {
  const [timeLeft , setTimeLeft] = useState('');

  const { doRequest , errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders')
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    
    return () => {
      clearInterval(timerId);
    }

  }, []);

  if(timeLeft < 0){
    return (
      <div>Order Expired</div>
    )
  };
  
  return (
    <div>
      <div>Time left to pay : {timeLeft} seconds</div>
      <div>
      <StripeCheckout 
        token={({id}) => doRequest({ token: id })}
        stripeKey="pk_test_51K8V8wF1q3ZKmhsLwK1hBb3SIM2Nc8WSJybfbYcQl7mh5R6YAvkiRBzs44jBcP6vXHWGOVwU6iVAjpmEn5n7Axmo00FHtYWyFm"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      </div>
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context , client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;