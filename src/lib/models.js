import { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema({
  name: String,
  price: Number
}, { timestamps: true });

const CheckoutSchema = new Schema({
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,        // snapshot name
    price: Number,       // snapshot price
    qty: Number,
    lineTotal: Number
  }],
  total: Number,
  customer: {
    name: String,
    email: String
  },
  status: { type: String, enum: ['PENDING','PAID','CANCELLED'], default: 'PENDING' }
}, { timestamps: true });

const PaymentSchema = new Schema({
  checkoutId: { type: Schema.Types.ObjectId, ref: 'Checkout' },
  provider: { type: String, default: 'xendit' },
  invoiceId: String,
  amount: Number,
  status: { type: String, enum: ['PENDING','PAID','EXPIRED','FAILED'], default: 'PENDING' },
  raw: Schema.Types.Mixed
}, { timestamps: true });

export const Product  = models.Product  || model('Product', ProductSchema);
export const Checkout = models.Checkout || model('Checkout', CheckoutSchema);
export const Payment  = models.Payment  || model('Payment', PaymentSchema);
