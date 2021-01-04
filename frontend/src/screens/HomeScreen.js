import React, {useEffect} from 'react';
import Meta from '../components/Meta';
import {useDispatch, useSelector} from 'react-redux';
import {Row, Col, Jumbotron, Image} from 'react-bootstrap';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import {listProducts} from '../actions/productActions';


const HomeScreen = ({match}) => {

    const keyword = match.params.keyword;
    const pageNumber = match.params.pageNumber || 1;

    const dispatch = useDispatch();
    const productList = useSelector(state => state.productList);
    const {loading, error, products, page, pages} = productList;

    useEffect(() => {
        dispatch(listProducts(keyword, pageNumber));
    }, [dispatch, keyword, pageNumber]);
    
    return (
        <>
            <Jumbotron className='my-1 py-3'>
                <h2>What is trail magic?</h2>
                <p>Trail magic means something unique to every hiker, but to most, it is: finding what you need most when you least expect it, experiencing something rare, extraordinary, or inspiring in nature, or encountering unexpected acts of generosity, that restore one’s faith in humanity.<br />
                <em>- Appalachian Trail Conservancy</em></p>

                <h2>How can I help?</h2>
                <p>The Station at 19E is a hostel located at Northbound mile 395 on the Appalachian Trail's US-19E road crossing. We ae unique in that we offer
                    a 20+ bed bunkhouse (with laundry + kitchen) AND a full pub with 200+ unique beers and food on site. If you'd like to make a hiker's day, 
                    you can use the links below to buy a bunk, beer, or food for them. During checkout, you can specify a Trail Name and Message for your intended recipient.
                </p>
                {/* <Row>
                    <Col md={2}>
                        <Image src='/hikerPics/001.jpg' className='border border-dark p-0' thumbnail />
                    </Col>
                    <Col  md={2}>
                        <Image src='/hikerPics/002.jpg' className='border border-dark p-0' thumbnail />
                    </Col>
                    <Col  md={2}>
                        <Image src='/hikerPics/003.jpg' className='border border-dark p-0' thumbnail />
                    </Col>

                    <Col  md={2}>
                        <Image src='/hikerPics/004.jpg' className='border border-dark p-0' thumbnail />
                    </Col>

                    <Col md={2}>
                        <Image src='/hikerPics/005.jpg' className='border border-dark p-0' thumbnail />
                    </Col>

                    <Col md={2}>
                        <Image src='/hikerPics/006.jpg' className='border border-dark p-0' thumbnail />
                    </Col>

                </Row> */}
            </Jumbotron>

           <Meta />
           {loading ? (<Loader />) : error ? (<Message variant='danger'>{error}</Message>) : 
            (<>
            <Row>
                {products.map(product => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                        <Product product={product} />
                    </Col>
                ))}
            </Row>
            <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} /> </>)
            }
                    </>
    )
}

export default HomeScreen;
