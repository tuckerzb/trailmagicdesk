import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, ListGroup, Image, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { createOrder } from '../actions/orderActions';
import { CreditCard, PaymentsForm } from 'react-square-web-payments-sdk';
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import Meta from '../components/Meta';
import CountrySelect from 'react-bootstrap-country-select';

const PlaceOrderScreen = ({ history }) => {
  const cart = useSelector((state) => state.cart);

  const dispatch = useDispatch();

  const orderState = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderState;

  const calculatedOrder = localStorage.getItem('calculatedOrder')
    ? JSON.parse(localStorage.getItem('calculatedOrder'))
    : null;
  if (!calculatedOrder) {
    throw new Error('Could not calculate order totals');
  }

  useEffect(() => {
    if (success) {
      dispatch({ type: ORDER_CREATE_RESET });
      localStorage.removeItem('cartItems');
      history.push(`/order/${order._id}`);
    }
  }, [history, dispatch, success, order, cart]);

  const [nonceErrors, setNonceErrors] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('us');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [processingError, setProcessingError] = useState('');
  const [processingLoading, setProcessingLoading] = useState(false);

  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((accum, item) => accum + item.price * item.qty, 0)
  );

  cart.taxPrice = addDecimals(Number(calculatedOrder.tax_money.amount / 100));
  cart.totalPrice = addDecimals(
    Number(Number(calculatedOrder.total_money.amount / 100))
  );

  if (calculatedOrder.total_money.amount / 100 < cart.itemsPrice) {
    throw new Error('Invalid order calculations');
  }

  const cardNonceResponseReceived = async (
    errors,
    nonce,
    cardData,
    buyerVerificationToken
  ) => {
    if (errors) {
      setNonceErrors([errors.map((error) => error.message)]);
      return;
    }
    setNonceErrors([]);
    setProcessingError('');
    setProcessingLoading(true);
    const { data } = await axios.post('/api/payment/authorize', {
      nonce,
      token: buyerVerificationToken,
      amount: Number(cart.totalPrice * 100),
      billingInfo: {
        name,
        email,
        address,
        city,
        state,
        zip: zipCode,
        country,
      },
      cartItems: cart.cartItems,
      recipient,
      message,
    });
    if (data.error) {
      setProcessingLoading(false);
      setProcessingError(data.error);
    } else if (data.payment.status === 'COMPLETED') {
      setProcessingLoading(false);
      dispatch(
        createOrder({
          orderItems: cart.cartItems,
          itemsPrice: cart.itemsPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
          recipient,
          message,
          user: data.user._id,
          paymentResult: {
            id: data.payment.id,
            status: data.payment.status,
            updated_at: data.payment.updated_at,
            order_id: data.payment.order_id,
            receipt_url: data.payment.receipt_url,
          },
        })
      );
    } else {
      setProcessingLoading(false);
      setProcessingError(
        'An error processing your payment has occurred. Please check your billing details and credit card information. If this error persists, please contact us at '
      );
    }
  };

  const createVerificationDetails = () => {
    return {
      amount: String(cart.totalPrice * 100),
      currencyCode: 'USD',
      intent: 'CHARGE',
      billingContact: {
        familyName: name.split(' ')[1],
        givenName: name.split(' ')[0],
        email,
        country: country.toUpperCase(),
        city: city,
        addressLines: [address],
        postalCode: zipCode,
      },
    };
  };

  return (
    <>
      {error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Row>
          <Meta title='Checkout' />
          <Col md={7}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Items</h2>
                {cart.cartItems.length === 0 ? (
                  <Message>Your Cart is Empty</Message>
                ) : (
                  <ListGroup variant='flush'>
                    {cart.cartItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col>
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                          </Col>
                          <Col md={4}>
                            {item.qty} * ${item.price} = $
                            {(item.qty * item.price).toFixed(2)}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </ListGroup.Item>
            </ListGroup>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Recipient</h2>
                <p>
                  Are you buying this trail magic for a specific hiker or
                  hikers? Enter their trail name below! (Note - some trail names
                  are popular and could be repeated within a group. It is
                  helpful to include your hiker's real first name in addition to
                  their trail name.)
                </p>
                <Form.Group controlId='recipient'>
                  <Form.Label>Trail Name (Optional)</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder=''
                    autoComplete='off'
                    value={recipient}
                    onChange={(e) =>
                      setRecipient(e.target.value)
                    }></Form.Control>
                </Form.Group>
                <h2>Message</h2>
                <p>We'll pass your message along to the lucky hiker!</p>
                <Form.Group controlId='message'>
                  <Form.Label>Message (Optional)</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}></Form.Control>
                </Form.Group>
              </ListGroup.Item>
            </ListGroup>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Billing Information</h2>
                <Form.Group controlId='name'>
                  <Form.Label>Name on Card</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Name'
                    autoComplete='off'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='email'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='address'>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Address'
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='city'>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='City'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='state'>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='State'
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='postalCode'>
                  <Form.Label>ZIP Code</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Postal Code'
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required></Form.Control>
                </Form.Group>
                <Form.Group controlId='country'>
                  <Form.Label>Country</Form.Label>
                  <CountrySelect
                    value={country && country.toLowerCase()}
                    onChange={setCountry}
                    valueAs='id'
                  />
                </Form.Group>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={5}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Order Summary</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${cart.itemsPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>${cart.totalPrice}</Col>
                  </Row>
                </ListGroup.Item>
                {error && (
                  <ListGroup.Item>
                    <Message variant='danger'>{error}</Message>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  {processingLoading && <Loader />}
                  {processingError && (
                    <Message variant='danger'>{processingError}</Message>
                  )}
                  <PaymentsForm
                    applicationId='sq0idp-bzu7lTKlowIZvtnJOaHTUw'
                    locationId='RKDK2RNEYZXW9'
                    cardNonceResponseReceived={cardNonceResponseReceived}
                    createVerificationDetails={createVerificationDetails}>
                    <CreditCard />
                  </PaymentsForm>

                  <div className='sq-error-message'>
                    {nonceErrors.map((errorMessage) => (
                      <li key={`sq-error-${errorMessage}`}>{errorMessage}</li>
                    ))}
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default PlaceOrderScreen;
