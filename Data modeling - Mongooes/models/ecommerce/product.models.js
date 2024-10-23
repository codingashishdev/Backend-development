import mongooes, { mongo, MongooseError } from 'mongoose';

const productSchema = new mongooes.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      default: 0,
      type: Number,
    },
    category: {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    owner: {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const UserProduct = mongooes.model('Product', productSchema);
