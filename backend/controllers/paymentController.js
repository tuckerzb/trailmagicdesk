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

  const userPayload = {
    name: req.body.billingInfo.name,
    email: req.body.billingInfo.email,
    billingAddress: req.body.billingInfo.address,
    billingCity: req.body.billingInfo.city,
    billingState: req.body.billingInfo.state,
    billingCountry: req.body.billingInfo.country,
    billingZip: req.body.billingInfo.zip
  }

  const duplicateUser = await User.findOne({email: req.body.billingInfo.email});
  if (duplicateUser) {
    const response = {
      payment: data.payment,
      user: duplicateUser
    };
    res.json(response);
  } else {
    const user = await new User(userPayload);
    const createdUser = await user.save();
    res.json({
      payment: data.payment,
      user: createdUser
    });
  }

})

export {authorizePayment};
