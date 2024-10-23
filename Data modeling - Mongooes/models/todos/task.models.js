import mongooes from 'mongoose';

const taskSchema = new mongooes.Schema(
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
    subTodos: [
      {
        type: mongooes.Schema.Types.ObjectId,
        ref: 'subTask',
      },
    ], // array of subtodos
  },
  { timestamps: true }
);

export const Todo = mongooes.model('Task', taskSchema);
