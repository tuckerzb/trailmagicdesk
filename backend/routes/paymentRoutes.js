import express from 'express';
import {authorizePayment, calculateOrder} from '../controllers/paymentController.js';
const router = express.Router();

router.route('/authorize').post(authorizePayment);
router.route('/calculate').post(calculateOrder);

export default router;