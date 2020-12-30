import express from 'express';
import {authorizePayment} from '../controllers/paymentController.js';
const router = express.Router();

router.route('/authorize').post(authorizePayment);

export default router;