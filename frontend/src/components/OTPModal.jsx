import React, { useEffect, useState } from 'react';
import OTPInput from './OTPInput';
import googleIcon from '../assets/icons/google.svg';

const OTPModal = ({ isOpen, onClose, sendOTP, validateOTP, handleGoogleOauth = ()=>{} }) => {
  const [step, setStep] = useState(1); // 1: Phone Input, 2: OTP Verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dialCode, setDialCode] = useState('+91'); // Default country code
  const [otp, setOtp] = useState('');
  const [resetOtp, setResetOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countryCodes, setCountryCodes] = useState([]);
  const [OtpResendTime, setOtpResendTime] = useState(0);

  // Load country codes from the JSON file
  useEffect(() => {
    const loadCountryCodes = async () => {
      try {
        const response = await fetch('/CountryCodes.json'); // Path to your JSON file
        const data = await response.json();
        setCountryCodes(data);
      } catch (err) {
        console.error('Failed to load country codes:', err);
      }
    };

    loadCountryCodes();
  }, []);

  // Effect to run resend OTP timer 
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (OtpResendTime > 0) {
        setOtpResendTime(prevTime => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [OtpResendTime]);

  // Handle phone number submission
  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await sendOTP(`${dialCode}${phoneNumber}`);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Handle OTP validation
  const handleValidateOTP = async () => {
    setLoading(true);
    setError('');
    try {
      await validateOTP(`${dialCode}${phoneNumber}`, otp);
      onClose(); // Close the modal
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  // Handle resend OTP 
  const handleResendOTP = async () => {
    setError('');
    try {
      await sendOTP(`${dialCode}${phoneNumber}`);
      setResetOtp(true);
      setOtpResendTime(120); // 2 mins
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-8 bg-flash-white rounded-lg shadow-lg">
        <h3 className="text-3xl font-semibold text-dark-blue mb-1">
          {step === 1 ? 'Enter your phone number to see the result' : 'Verify your phone'}
        </h3>

        <p className="text-sm text-cool-gray mb-8">
          {step === 1
            ? 'We will send an OTP on your phone'
            : 'We have sent an OTP on your phone'}
        </p>

        {/* Step 1: Phone Number Input */}
        {step === 1 && (
          <div>
            <div className="flex gap-0">
              <input
                list="dial-codes"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                className="w-20 px-2 py-2 border rounded-s font-roboto focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Code"
              />
              <datalist id="dial-codes">
                {countryCodes.map((item) => (
                  <option key={item.code} value={item.dial_code}>
                    {item.name}
                  </option>
                ))}
              </datalist>

              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border font-roboto rounded-e focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading || !phoneNumber}
              className="mt-8 w-full px-4 py-2 text-white bg-azure-blue rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className='text-cool-gray text-xs text-center mx-auto my-8'>OR</div>
            <button type="button" onClick={handleGoogleOauth} className='text-dark-blue font-medium w-full flex gap-2 items-center justify-center shadow-input rounded px-4 py-2 outline-none focus:ring-2 focus:ring-azure-blue hover:ring-2 hover:ring-azure-blue'>
              <img src={googleIcon} width='24px' alt='Google' />
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Step 2: OTP Input */}
        {step === 2 && (
          <div>
            <OTPInput length={4} onChangeOTP={(value) => setOtp(value)} reset={resetOtp} />
            <div className='text-sm mt-4'>
              <span className=' text-cool-gray'>Didn't get OTP? </span>
              {OtpResendTime > 0 ?
                <span className='text-dark-blue font-roboto'>Resend in {OtpResendTime}s</span> :
                <button type="button" tabIndex='1' onClick={handleResendOTP} className='bg-none hover:underline text-dark-blue font-medium'>Resend</button>
              }
            </div>
            <button
              onClick={handleValidateOTP}
              disabled={loading || !otp}
              className="mt-8 w-full px-4 py-2 text-sec-white bg-persian-green rounded hover:bg-persian-green/90 disabled:opacity-50 outline-none focus:ring-2 focus:ring-black"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        {/* Close Modal */}
        <button
          onClick={onClose}
          className="absolute px-2 py-0 text-3xl font-light top-2 right-3 text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default OTPModal;
