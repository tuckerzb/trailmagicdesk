import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Row, Col, ListGroup, Image, Card, Form} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';
import Message from '../components/Message';
import {Link} from 'react-router-dom';
import {createOrder} from '../actions/orderActions';
import { SquarePaymentForm } from 'react-square-payment-form';
import 'react-square-payment-form/lib/default.css';
import {
    CreditCardNumberInput,
    CreditCardExpirationDateInput,
    CreditCardPostalCodeInput,
    CreditCardCVVInput,
    CreditCardSubmitButton
  } from 'react-square-payment-form'
import { ORDER_CREATE_RESET, ORDER_DETAILS_RESET } from '../constants/orderConstants';
import Meta from '../components/Meta';
import CountrySelect from 'react-bootstrap-country-select';

const PlaceOrderScreen = ({history}) => {

    const cart = useSelector(state => state.cart);

    const dispatch = useDispatch();

    const orderState = useSelector(state => state.orderCreate);
    const {order, success, error} = orderState;

    const [squareConfig, setSquareConfig] = useState({});

    const getSquareConfig = async () => {
       await axios.get('/api/config/square').then(result => {
           setSquareConfig(result.data);
        });

    }

    useEffect(() => {
        getSquareConfig();
    
        if (success) {
            dispatch({type: ORDER_CREATE_RESET});
            localStorage.removeItem('cartItems');
            history.push(`/order/${order._id}`)
        }

    }, [history, dispatch, success, order]);

    const [nonceErrors, setNonceErrors] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [zipCode, setZipCode] = useState( '');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('us');
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');

    const addDecimals = (num) => (
        (Math.round(num * 100) / 100).toFixed(2)
    )

    cart.itemsPrice = addDecimals(cart.cartItems.reduce((accum, item) => (
        accum + (item.price * item.qty)
    ), 0));

    cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)));
    cart.totalPrice = addDecimals(Number(Number(cart.itemsPrice) + Number(cart.taxPrice)));

    const cardNonceResponseReceived = async (errors, nonce, cardData, buyerVerificationToken) => {
        if (errors) {
          setNonceErrors([errors.map(error => error.message)])
          return
        }
        setNonceErrors([]);
        const {data} = await axios.post('/api/payment/authorize', { 
            nonce,
            token: buyerVerificationToken, 
            amount: (Number((cart.totalPrice * 100))),
            billingInfo: {
                name,
                email,
                address,
                city,
                state,
                zip: zipCode,
                country
            }
         });

         if(data.payment.status === "COMPLETED") {
             dispatch(createOrder({
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
                    receipt_url: data.payment.receipt_url
                }
            }));
         }
      }

      const createVerificationDetails = () => {
        return {
          amount: (String((cart.totalPrice * 100))),
          currencyCode: "USD",
          intent: "CHARGE",
          billingContact: {
            familyName: name.split(' ')[1],
            givenName: name.split(' ')[0],
            email,
            country: country.toUpperCase(),
            city: city,
            addressLines: [address],
            postalCode: zipCode
          }
        }
      }

    return (
        <>
            <Row>
                <Meta title='Checkout' />
                <Col md={7}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {cart.cartItems.length === 0 ? <Message>Your Cart is Empty</Message> : (
                                <ListGroup variant='flush'>
                                    {cart.cartItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </Col>
                                                <Col md={4}>
                                                     {item.qty} * ${item.price} = ${(item.qty * item.price).toFixed(2)}
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
                            <p>Are you buying this trail magic for a specific hiker or hikers? Enter their trail name below!
                                (Note - some trail names are popular and could be repeated within a group. It is helpful to include your hiker's real first name in addition to their trail name.)
                            </p>
                            <Form.Group controlId='recipient'>
                                <Form.Label>Trail Name (Optional)</Form.Label>
                                <Form.Control type='text' placeholder='' value={recipient} onChange={(e) => setRecipient(e.target.value)}></Form.Control>
                            </Form.Group>
                            <h2>Message</h2>
                            <p>We'll pass your message along to the lucky hiker!
                            </p>
                            <Form.Group controlId='message'>
                                <Form.Label>Message (Optional)</Form.Label>
                                <Form.Control type='text' placeholder='' value={message} onChange={(e) => setMessage(e.target.value)}></Form.Control>
                            </Form.Group>
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Billing Information</h2>
                            <Form.Group controlId='name'>
                                <Form.Label>Name on Card</Form.Label>
                                <Form.Control type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='email'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type='text' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='address'>
                                <Form.Label>Address</Form.Label>
                                <Form.Control type='text' placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='city'>
                                <Form.Label>City</Form.Label>
                                <Form.Control type='text' placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='state'>
                                <Form.Label>State</Form.Label>
                                <Form.Control type='text' placeholder='State' value={state} onChange={(e) => setState(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='postalCode'>
                                <Form.Label>ZIP Code</Form.Label>
                                <Form.Control type='text' placeholder='Postal Code' value={zipCode} onChange={(e) => setZipCode(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlId='country'>
                                <Form.Label>Country</Form.Label>
                                <CountrySelect value={country && country.toLowerCase()} onChange={setCountry} valueAs='id' />
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
                                    <Col>
                                        Items
                                    </Col>
                                    <Col>
                                    ${cart.itemsPrice}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Tax
                                    </Col>
                                    <Col>
                                    ${cart.taxPrice}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Total
                                    </Col>
                                    <Col>
                                    ${cart.totalPrice}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                                {error && (
                                <ListGroup.Item>
                                    <Message variant='danger'>{error}</Message>
                                </ListGroup.Item>
                                )
                                }
                            <ListGroup.Item>
                                <SquarePaymentForm
                                    sandbox={true}
                                    applicationId='sandbox-sq0idb-c8hnuHGwxUN2i9ksVg5LuA'
                                    locationId='LGSQ2AEHVVSZQ'
                                    cardNonceResponseReceived={cardNonceResponseReceived}
                                    createVerificationDetails={createVerificationDetails}
                                    >
                                        <fieldset className="sq-fieldset">
                                            <CreditCardNumberInput />
                                            <div className="sq-form-third">
                                            <CreditCardExpirationDateInput />
                                            </div>

                                            <div className="sq-form-third">
                                            <CreditCardPostalCodeInput />
                                            </div>

                                            <div className="sq-form-third">
                                            <CreditCardCVVInput />
                                            </div>
                                        </fieldset>

                                        <CreditCardSubmitButton>
                                            Pay ${cart.totalPrice}
                                        </CreditCardSubmitButton>
                                    </SquarePaymentForm>

                                    <div className="sq-error-message">
                                    {nonceErrors.map(errorMessage =>
                                        <li key={`sq-error-${errorMessage}`}>{errorMessage}</li>
                                    )}
                                    </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
    )

}

export default PlaceOrderScreen;