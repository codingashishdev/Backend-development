import mongooes from 'mongoose';

const categorySchema = new mongooes.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = mongooes.model('Category', categorySchema);
