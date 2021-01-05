import React, {useEffect} from 'react';
import {Row, Col, ListGroup, Image, Card} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';
import Message from '../components/Message';
import {Link} from 'react-router-dom';
import Loader from '../components/Loader';
import {getOrderDetails} from '../actions/orderActions';
import {CART_RESET} from '../constants/cartConstants';
import Meta from '../components/Meta';

const OrderScreen = ({match, history}) => {
    const dispatch = useDispatch();

    const id = match.params.id;

    const orderDetails = useSelector(state => state.orderDetails);
    const {order, loading, error} = orderDetails;
    useEffect(() => {

        dispatch({type: CART_RESET});
        if (!order) {
          dispatch(getOrderDetails(id));
        }
        
    }, [dispatch, history, id, order]);

    if (!loading) {
        //   Calculate prices
        const addDecimals = (num) => {
          return (Math.round(num * 100) / 100).toFixed(2)
        }
    
        order.itemsPrice = addDecimals(
          order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
        )
        order.taxPrice = addDecimals(order.taxPrice);
        order.totalPrice = addDecimals(order.totalPrice);
      }

      return loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <h1>Thank you for your order!</h1>
          <Row>
            <Meta title='Order Details' />
            <Col md={8}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Details</h2>
                  <p>
                    <strong>Order ID:</strong> {order._id}<br />
                    <strong>Name: </strong> {order.user.name}<br />
                    <strong>Email: </strong> 
                    <a href={`mailto:${order.user.email}`}>{order.user.email}</a><br />
                    <strong>Address: </strong> {order.user.billingAddress}<br />
                    <strong>City: </strong> {order.user.billingCity}<br />
                    <strong>State: </strong> {order.user.billingState}<br />
                    <strong>ZIP: </strong> {order.user.billingZip}<br />
                    <strong>Country: </strong> {order.user.billingCountry.toUpperCase()}<br /><br />
                    <strong>Hiker Recipient: </strong>{order.recipient}<br />
                    <strong>Message: </strong>{order.message}
                  </p>

                </ListGroup.Item>
    
                <ListGroup.Item>
                  <h2>Payment Method</h2>
                  <p>
                    <strong>Method: </strong>{order.paymentMethod}<br />
                    <strong>Payment Date: </strong>{order.paymentResult.updated_at.substring(0,10)}<br />
                    <strong>Link to Receipt: </strong><a href={order.paymentResult.receipt_url}>{order.paymentResult.receipt_url}</a>
                  </p>
                </ListGroup.Item>
    
                <ListGroup.Item>
                  <h2>Order Items</h2>
                  {order.orderItems.length === 0 ? (
                    <Message>Order is empty</Message>
                  ) : (
                    <ListGroup variant='flush'>
                      {order.orderItems.map((item, index) => (
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
                              {item.qty} x ${item.price} = ${item.qty * item.price}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <h2>Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>${order.itemsPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax</Col>
                      <Col>${order.taxPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Total</Col>
                      <Col>${order.totalPrice}</Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )
    }

export default OrderScreen;