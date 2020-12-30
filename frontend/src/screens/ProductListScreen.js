import React, {useEffect} from 'react'
import {LinkContainer} from 'react-router-bootstrap';
import {Table, Button, Row, Col, Form} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import {listProducts, deleteProduct, createProduct, updateProductIsActive} from '../actions/productActions';
import {PRODUCT_CREATE_RESET} from '../constants/productConstants'

const ProductListScreen = ({history, match}) => {
    const pageNumber = match.params.pageNumber || 1;
   const dispatch = useDispatch();
   
   const productList = useSelector((state) => state.productList)
   const { loading, error, products, page, pages } = productList

   const userLogin = useSelector(state => state.userLogin);
   const {userInfo} = userLogin;

   const productDelete = useSelector(state => state.productDelete);
   const {success:successDelete, loading: loadingDelete, error:errorDelete} = productDelete;

   const productCreate = useSelector(state => state.productCreate);
   const {success:successCreate, loading: loadingCreate, error:errorCreate, product:createdProduct} = productCreate;

   const productUpdateIsActive = useSelector(state => state.productUpdateIsActive);
   const {success:successIsActive, error:errorIsActive, loading:loadingIsActive} = productUpdateIsActive;


   useEffect(() => {
       dispatch({type: PRODUCT_CREATE_RESET})
       if (!userInfo.isAdmin) {
            history.push('/login');
       }
       
       if (successCreate) {
           history.push(`/admin/products/${createdProduct._id}/edit`);
       } else {
            dispatch(listProducts('', pageNumber, true));
       }
       
   }, [dispatch, history, userInfo, successCreate, createdProduct, successDelete, pageNumber, successIsActive])

   const deleteHandler = (id) => {
       if (window.confirm('Are you sure?')) {
           dispatch(deleteProduct(id));
       }
   }

   const createProductHandler = () => {
       dispatch(createProduct());
   }

   const isActiveHandler = (id) => {
       console.log(id);
       dispatch(updateProductIsActive(id));
   }

    return (
        <>
            <Row className='align-items-center'>
                <Col>
                    <h1>Products</h1>
                </Col>
                <Col className='text-right'>
                    <Button className='my-3' onClick={createProductHandler}><i className='fas fa-plus'>Create Product</i></Button>
                </Col>
            </Row>
            {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
            {errorIsActive && <Message variant='danger'>{errorIsActive}</Message>}
            {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
            {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                <>
                <Table striped bordered hover responsive className='table-sm'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Active</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id}>
                                <td>{product._id}</td>
                                <td>{product.name}</td>
                                <td>${product.price}</td>
                                <td>{product.category}</td>
                                <td>
                                    <Form.Check type='switch' id={`isActive-${product._id}`} onChange={() => isActiveHandler(product._id)} checked={product.isActive} />
                                </td>
                                <td>
                                    <LinkContainer to={`/admin/products/${product._id}/edit`}>
                                        <Button variant='light' className='btn-sm'><i className='fas fa-edit'></i></Button>
                                    </LinkContainer>
                                    <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(product._id)}><i className='fas fa-trash'></i></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Paginate pages={pages} page={page} isAdmin={true} />
                </>
            )}
        </>
    )
}

export default ProductListScreen
