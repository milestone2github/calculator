const mongoose = require('mongoose');

// Define the OTP schema
const retirementCalculatorSchema = new mongoose.Schema(
  {
    currentAge: Number,
    retirementAge: Number,
    lifeExpectancy: Number,
    monthlyExpense: Number,
    annualInflation: Number,
    accumulationPhaseReturn: Number,
    withdrawalPhaseReturn: Number,
    existingInvestment: Number,
    existingSip: Number,
    postRetirementIncome: Number,
    phone: String,
    email: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '3d', // 3 days
    },
  },
  { timestamps: true }
);

// Create the model
const RetirementCalculator = mongoose.model('RetirementCalculator', retirementCalculatorSchema);

module.exports = RetirementCalculator;
