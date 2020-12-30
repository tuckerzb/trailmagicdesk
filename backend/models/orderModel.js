import mongoose from 'mongoose'

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
      default: 'Square'
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      updated_at: { type: String },
      order_id: { type: String },
      receipt_url: {type: String}
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    recipient: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
)

orderSchema.pre('create', async function (next) {
  this.taxPrice = (Math.round(this.taxPrice * 100) / 100).toFixed(2);
  this.totalPrice = (Math.round(this.totalPrice * 100) / 100).toFixed(2);
});

orderSchema.pre('save', async function (next) {
  this.taxPrice = (Math.round(this.taxPrice * 100) / 100).toFixed(2);
  this.totalPrice = (Math.round(this.totalPrice * 100) / 100).toFixed(2);
});

const Order = mongoose.model('Order', orderSchema);

export default Order