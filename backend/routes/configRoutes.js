import express from 'express';
import dotenv from 'dotenv';
const router = express.Router();

router.route('/square').get((req, res) => (
    res.send({
        SQUARE_APPLICATION_ID: process.env.SQUARE_APPLICATION_ID,
        SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN,
        SQUARE_LOCATION_ID: process.env.SQUARE_LOCATION_ID
    })
));

export default router;