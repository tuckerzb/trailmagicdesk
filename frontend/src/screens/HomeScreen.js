import React, { useEffect } from 'react';
import Meta from '../components/Meta';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Jumbotron, Image } from 'react-bootstrap';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import { listProducts } from '../actions/productActions';

const HomeScreen = ({ match }) => {
  const keyword = match.params.keyword;
  const pageNumber = match.params.pageNumber || 1;

  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  useEffect(() => {
    dispatch(listProducts(keyword, pageNumber));
  }, [dispatch, keyword, pageNumber]);

  return (
    <>
      <div className='text-center my-2'>
        <Image src='station-cheer.jpg' className='mx-auto w-50' fluid />
      </div>
      <Jumbotron className='my-1 py-3'>
        <h2>What is trail magic?</h2>
        <p>
          Trail magic means something unique to every hiker, but to most, it is:
          finding what you need most when you least expect it, experiencing
          something rare, extraordinary, or inspiring in nature, or encountering
          unexpected acts of generosity, that restore one’s faith in humanity.
          <br />
          <em>- Appalachian Trail Conservancy</em>
        </p>

        <h2>How can I help?</h2>
        <p>
          The Station at 19E is a hostel located at Northbound mile 395 on the
          Appalachian Trail's US-19E road crossing. We are unique in that we
          offer a 20+ bed bunkhouse (with laundry + kitchen) AND a full pub with
          200+ unique beers and food on site. If you'd like to make a hiker's
          day, you can use the links below to buy a beer or bunk for them.
          During checkout, you can specify a Trail Name and Message for your
          intended recipient, but this is totally optional.
        </p>
        {/* <Row>
                    <Col className='d-xs-none d-md-block' md={2}>
                        <Image src='/hikerPics/001.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>
                    <Col  md={2}>
                        <Image src='/hikerPics/002.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>
                    <Col  md={2}>
                        <Image src='/hikerPics/003.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>

                    <Col  md={2}>
                        <Image src='/hikerPics/004.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>

                    <Col md={2}>
                        <Image src='/hikerPics/005.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>

                    <Col md={2}>
                        <Image src='/hikerPics/006.jpg' className='border border-dark p-0' thumbnail fluid />
                    </Col>

                </Row> */}
      </Jumbotron>

      <Meta />
      <h2 className='text-center'>Closed for the Season</h2>
      <p className='text-center font-italic'>
        Thank you for supporting the Class of 2022! While The Station at 19E is
        still open and accepting hikers, Trail Magic From Your Desk is closed
        for the season for maintenance. Please check back next year!
      </p>

      {/* {loading ? (<Loader />) : error ? (<Message variant='danger'>{error}</Message>) : 
            (<>
            <Row>
                {products.map(product => {
                    if (!product.isCash) {
                    return (<Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                        <Product product={product} />
                    </Col>);
                    } else {
                        return null;
                    }
                })}
            </Row>
            <h2 className='text-center'>Cash Trail Magic</h2>
            <p className='text-center font-italic'>Your cash trail magic can be used for any product or service at The Station at 19E.</p>
            <Row>
                {products.map(product => {
                    if (product.isCash) {
                    return (<Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                        <Product product={product} />
                    </Col>);
                    } else {
                        return null;
                    }
                })}
            </Row>
            <Paginate pages={pages} page={page} keyword={keyword ? keyword : ''} /> </>)
            } */}
      <Jumbotron className='my-1 py-3'>
        <Row className='align-items-center'>
          <Col md={6}>
            <Image
              src='station-sign.jpg'
              className='border border-dark p-0'
              fluid
              thumbnail
            />
          </Col>
          <Col md={6} className='text-center'>
            <span className='h2 font-weight-bold'>
              Our goal is to provide trail magic to every thru-hiker visiting{' '}
              <a href={'https://www.thestationat19e.com'}>The Station at 19E</a>
              .<br />
              <br />
            </span>
            <p className='h2 font-italic'>
              You too can be a virtual trail angel - right from your desk!
            </p>
          </Col>
        </Row>
      </Jumbotron>
    </>
  );
};

export default HomeScreen;
