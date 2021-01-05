import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {Row, Col, Image, ListGroup, Card, Button, Form} from 'react-bootstrap';
import Meta from '../components/Meta';
import Loader from '../components/Loader';
import Message from '../components/Message';
import {listProductDetails} from '../actions/productActions';


const ProductScreen = ({history, match}) => {
    const [qty, setQty] = useState(1);

    const dispatch = useDispatch();
    const productDetails = useSelector(state => state.productDetails);
    const {loading, error, product} = productDetails;
    
    useEffect(() => {
        dispatch(listProductDetails(match.params.id));
    }, [dispatch, match]);

    const addtoCartHandler = () => {
        history.push(`/cart/${match.params.id}?qty=${qty}`);
    }

    return (
        <>
        <Link className='btn btn-light my-3' to='/'>
            Go Back
        </Link>
            {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
           <>
           <Meta title={product.name} />
           <Row>
                <Col md={6}>
                    <Image src={product.image} alt={product.name} fluid />
                </Col>
                <Col md={3}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h3>{product.name}</h3>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Price: ${product.price}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            Description: {product.description}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                    Price:
                                    </Col>
                                    <Col>
                                    <strong>${product.price}</strong></Col>
                                </Row>
                            </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>
                                        Quantity:
                                        </Col>
                                        <Col>
                                        <Form.Control type='number' min='1' placeholder='1' value={qty} onChange={(e) => setQty(e.target.value)}></Form.Control>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            

                            <ListGroup.Item>
                                <Button onClick={addtoCartHandler} className='btn-block' type='button'>
                                    Add to Cart
                                </Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
            </>
            )}
        </>
    );
}

export default ProductScreen;
