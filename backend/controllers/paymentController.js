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
  const config = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SQUARE_BEARER_TOKEN}` 
    }
  };
  const pickupdDate = new Date();
  let orderPayload = {
    "idempotency_key": uuidv4(),
    "order": {
      "reference_id": uuidv4(),
      "location_id": process.env.SQUARE_LOCATION_ID,
      "line_items": [],
      "taxes": [
        {
          "uid": "TRANSACTION_FEE",
          "catalog_object_id": process.env.SQUARE_TRANSACTION_FEE,
          "scope": "ORDER"
        }
      ],
      "fulfillments": [ {
          "type": "PICKUP",
          "pickup_details": {
              "recipient": {
                  "display_name": req.body.billingInfo.name,
                  "email_address": req.body.billingInfo.email
              },
              "note": "Recipient: " + req.body.recipient + " Message: " + req.body.message,
              "schedule_type": "ASAP",
              "pickup_at": pickupdDate.toISOString()
          }
      }]
    }
  }
  req.body.cartItems.forEach(item => {
    orderPayload.order.line_items.push({
      quantity: String(item.qty),
      catalog_object_id: item.squareCatalogId,
      applied_taxes: [
        {
          uid: uuidv4(),
          tax_uid: item.squareTaxId[0].name
        }
      ]
    });
    if (!orderPayload.order.taxes.find(x => x.uid === item.squareTaxId[0].name)) {
      orderPayload.order.taxes.push({
        uid: item.squareTaxId[0].name,
        catalog_object_id: item.squareTaxId[0].squareCatalogId,
        scope: "LINE_ITEM"
      })
    }

  });

  const orderUrl = "https://connect.squareupsandbox.com/v2/orders";
  try {
    const result = await axios.post(orderUrl, orderPayload, config);
    const paymentPayload = {
      "source_id": req.body.nonce,
      "verification_token": req.body.token,
      "autocomplete": true,
      "location_id": process.env.SQUARE_LOCATION_ID,
     "order_id": String(result.data.order.id),
      "amount_money": { 
      "amount": req.body.amount,
      "currency": "USD"
      },
      "idempotency_key": uuidv4()
  }
const paymentUrl = "https://connect.squareupsandbox.com/v2/payments";

try {
  const {data} = await axios.post(paymentUrl, paymentPayload, config);
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
} catch (e) {
  console.log(e);
}

  } catch (e) {
    console.log(e);
  }

})

// @desc     Calculate an order
// @route    POST /api/payment/calculate
// @access   Private
const calculateOrder = asyncHandler(async (req, res) => {  
  const config = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SQUARE_BEARER_TOKEN}` 
    }
  };
  
  let orderPayload = {
    "idempotency_key": uuidv4(),
    "order": {
      "reference_id": uuidv4(),
      "location_id": process.env.SQUARE_LOCATION_ID,
      "line_items": [],
      "taxes": [
        {
          "uid": "TRANSACTION_FEE",
          "catalog_object_id": process.env.SQUARE_TRANSACTION_FEE,
          "scope": "ORDER"
        }
      ],
    }
  }
  req.body.cartItems.forEach(item => {
    orderPayload.order.line_items.push({
      quantity: String(item.qty),
      catalog_object_id: item.squareCatalogId,
      applied_taxes: [
        {
          uid: uuidv4(),
          tax_uid: item.squareTaxId[0].name
        }
      ]
    });
    if (!orderPayload.order.taxes.find(x => x.uid === item.squareTaxId[0].name)) {
      orderPayload.order.taxes.push({
        uid: item.squareTaxId[0].name,
        catalog_object_id: item.squareTaxId[0].squareCatalogId,
        scope: "LINE_ITEM"
      })
    }

  });

  const orderUrl = "https://connect.squareupsandbox.com/v2/orders/calculate";
  try {
    const result = await axios.post(orderUrl, orderPayload, config);
    const {data} = result;
    res.json(data);

  } catch (e) {
    res.json(e);
  }
})

export {authorizePayment, calculateOrder};
