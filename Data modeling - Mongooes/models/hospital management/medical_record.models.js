import mongooes from 'mongoose';

const medicalRecordSchema = new mongooes.Schema({}, { timestamps: true });

export const MedicalRecord = mongooes.model(
  'MedicalRecord',
  medicalRecordSchema
);
