import React, {useEffect, useState} from 'react';
import axios from 'axios';
import env from 'react-dotenv';
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
import { ORDER_CREATE_RESET } from '../constants/orderConstants';
import Meta from '../components/Meta';
import CountrySelect from 'react-bootstrap-country-select';

const PlaceOrderScreen = ({history}) => {

    const cart = useSelector(state => state.cart);
    const userLogin = useSelector(state => state.userLogin);
    const {userInfo} = userLogin;

    const dispatch = useDispatch();

    const orderState = useSelector(state => state.orderCreate);
    const {order, success, error} = orderState;

    useEffect(() => {
        if (!userInfo) {
            history.push('/login');
        }
        if (success) {
            dispatch({type: ORDER_CREATE_RESET});
            localStorage.removeItem('cartItems');
            history.push(`/order/${order._id}`)
        }

    }, [history, dispatch, success, order, userInfo])

    const [nonceErrors, setNonceErrors] = useState([]);
    const [address, setAddress] = useState(userInfo.billingAddress);
    const [city, setCity] = useState(userInfo.billingCity);
    const [zipCode, setZipCode] = useState(userInfo.billingZip);
    const [state, setState] = useState(userInfo.billingState);
    const [country, setCountry] = useState(userInfo.billingCountry);
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');

    // // if (userInfo) {
    //     setAddress(userInfo.billingAddress);
    //     setCity(userInfo.billingCity);
    //     setState(userInfo.billingState);
    //     setZipCode(userInfo.billingZip);
    //     setCountry(userInfo.billingCountry);
    // // }

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
                _id: userInfo._id,
                address,
                city,
                state,
                zip: zipCode,
                country
            }
         });

         if(data.status === "COMPLETED") {

             dispatch(createOrder({
                orderItems: cart.cartItems,
                itemsPrice: cart.itemsPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
                recipient,
                message,
                paymentResult: {
                    id: data.id,
                    status: data.status,
                    updated_at: data.updated_at,
                    order_id: data.order_id,
                    receipt_url: data.receipt_url
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
            familyName: userInfo.name.split(' ')[1],
            givenName: userInfo.name.split(' ')[0],
            email: userInfo.email,
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
                            <Form.Group controlID='recipient'>
                                <Form.Label>Trail Name (Optional)</Form.Label>
                                <Form.Control type='text' placeholder='' value={recipient} onChange={(e) => setRecipient(e.target.value)}></Form.Control>
                            </Form.Group>
                            <h2>Message</h2>
                            <p>We'll pass your message along to the lucky hiker!
                            </p>
                            <Form.Group controlID='message'>
                                <Form.Label>Message (Optional)</Form.Label>
                                <Form.Control type='text' placeholder='' value={message} onChange={(e) => setMessage(e.target.value)}></Form.Control>
                            </Form.Group>
                        </ListGroup.Item>
                    </ListGroup>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Billing Information</h2>
                            <Form.Group controlID='address'>
                                <Form.Label>Address</Form.Label>
                                <Form.Control type='text' placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlID='city'>
                                <Form.Label>City</Form.Label>
                                <Form.Control type='text' placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlID='city'>
                                <Form.Label>State</Form.Label>
                                <Form.Control type='text' placeholder='State' value={state} onChange={(e) => setState(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlID='postalCode'>
                                <Form.Label>ZIP Code</Form.Label>
                                <Form.Control type='text' placeholder='Postal Code' value={zipCode} onChange={(e) => setZipCode(e.target.value)} required></Form.Control>
                            </Form.Group>
                            <Form.Group controlID='country'>
                                <Form.Label>Country</Form.Label>
                                <CountrySelect value={country.toLowerCase()} onChange={setCountry} valueAs='id' />
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
                                    applicationId={env.SQUARE_APPLICATION_ID}
                                    locationId={env.SQUARE_LOCATION_ID}
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