import asyncHandler from 'express-async-handler';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

// @desc     Send payment to square
// @route    POST /api/payment
// @access   Private
const authorizePayment = asyncHandler(async (req, res) => {  
  
  const payload = {
        "source_id": req.body.nonce,
        "verification_token": req.body.token,
        "autocomplete": true,
        "location_id": process.env.SQUARE_LOCATION_ID,
        "amount_money": { 
        "amount": req.body.amount,
        "currency": "USD"
        },
        "idempotency_key": uuidv4()
    }
  const url = "https://connect.squareupsandbox.com/v2/payments";
  const config = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.SQUARE_BEARER_TOKEN}` 
    }
  };

  const {data} = await axios.post(url, payload, config);
  

  const user = await User.findById(req.body.billingInfo._id);
  user.billingAddress = req.body.billingInfo.address;
  user.billingCity = req.body.billingInfo.city;
  user.billingState = req.body.billingInfo.state;
  user.billingCountry = req.body.billingInfo.country;
  user.billingZip = req.body.billingInfo.zip;
  await user.save();

  res.json(data.payment);

})

export {authorizePayment};
