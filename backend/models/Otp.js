const mongoose = require('mongoose');

// Define the OTP schema
const otpSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+\d{10,15}$/, "Invalid phone number format"], // E.164 format
    },
    email: {
      type: String,
      required: false,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    otp: {
      type: String,
      required: true,
      minlength: 4, 
      maxlength: 6,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, 
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
