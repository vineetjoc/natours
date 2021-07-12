import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51JBLnmSDiXrpvXLOm2jF0mbezhR7xidL2kAwcBqzeAALhYiiUpk57TcTByPjC8CixYjN7Q2v7htW7GfPtDkatgT400oLrHkD3v'
  );
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
