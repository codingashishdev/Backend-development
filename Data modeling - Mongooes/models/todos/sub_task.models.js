import mongooes from 'mongoose';

const subTaskSchema = new mongooes.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const subTask = mongooes.model('subTask ', subTaskSchema);
