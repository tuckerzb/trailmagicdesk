import axios from 'axios';
import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom';
import {Form, Button} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {listProductDetails, updateProduct} from '../actions/productActions';
import FormContainer from '../components/FormContainer';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';

const ProductEditScreen = ({match, history}) => {
    const productId = match.params.id;

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isCash, setIsCash] = useState(false);
    const [uploading, setUploading] = useState(false);

    const dispatch = useDispatch();

    const productDetails = useSelector((state) => state.productDetails);
    const {loading, error, product} = productDetails;

    const productUpdate = useSelector((state) => state.productUpdate);
    const {loading: loadingUpdate, error:errorUpdate, success:successUpdate} = productUpdate;

    useEffect(() => {
        if (successUpdate) {
            dispatch({type: PRODUCT_UPDATE_RESET});
            history.push('/admin/productList');
        } else {
            if (!product.name || product._id !== productId) {
                dispatch(listProductDetails(productId));
            } else {
                setName(product.name);
                setPrice(product.price);
                setImage(product.image);
                setCategory(product.category);
                setDescription(product.description);
                setIsCash(product.isCash);
            }
        }
    }, [dispatch, product, productId, history, successUpdate])

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            const {data} = await axios.post('/api/upload', formData, config);
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    }

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(updateProduct({
            _id: productId,
            name,
            price,
            category,
            description,
            image,
            isCash
        }));
    }

    return (
        <>
        <Link to='/admin/productList' className='btn btn-light my-3'>Go Back</Link>
        <FormContainer>
            <h1>Edit Product</h1>
            {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
            {loadingUpdate && <Loader />}
            {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> : (
                 <Form onSubmit={submitHandler}>
                 <Form.Group controlID='name'>
                         <Form.Label>Name</Form.Label>
                         <Form.Control type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)}></Form.Control>
                     </Form.Group>
                     <Form.Group controlID='email'>
                         <Form.Label>Price</Form.Label>
                         <Form.Control type='number' placeholder='Price' value={price} onChange={(e) => setPrice(e.target.value)}></Form.Control>
                     </Form.Group>
                     <Form.Group controlID='image'>
                         <Form.Label>Image</Form.Label>
                         <Form.Control type='text' placeholder='Image URL' value={image} onChange={(e) => setImage(e.target.value)}></Form.Control>
                        <Form.File id='image-file' label='Choose File' custom onChange={uploadFileHandler} />
                        {uploading && <Loader />}
                     </Form.Group>
                     <Form.Group controlID='category'>
                         <Form.Label>Category</Form.Label>
                         <Form.Control type='text' placeholder='Category' value={category} onChange={(e) => setCategory(e.target.value)}></Form.Control>
                     </Form.Group>
                     <Form.Group controlID='description'>
                         <Form.Label>Description</Form.Label>
                         <Form.Control type='text' placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)}></Form.Control>
                     </Form.Group>
                     <Form.Group controlID='isCash'>
                         <Form.Label>Is this a Cash product?</Form.Label>
                        <Form.Check type='switch' id={`isCash-${product.isCash}`} onChange={() => setIsCash(!product.isCash)} checked={product.isCash} />
                    </Form.Group>
                     <Button type='submit' variant='primary'>
                         Update
                     </Button>
                     </Form>
            )}
        </FormContainer>
        </>
    )
}

export default ProductEditScreen;
