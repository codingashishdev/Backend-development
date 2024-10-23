import mongooes from 'mongoose';

const patientSchema = new mongooes.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    diagnosedWith: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    bloodgrouo: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male, female, others'],
    },
    admittedAt: {
      type: mongooes.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
  },
  { timestamps: true }
);

export const Patient = mongooes.model('Patient', patientSchema);
