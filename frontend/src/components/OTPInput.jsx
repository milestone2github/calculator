import React, { useEffect, useRef } from 'react';

const OTPInput = ({ length = 6, onChangeOTP, customStyle, reset }) => {
  const inputsRef = useRef([...Array(length)].map(() => React.createRef()));

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) return; // Prevent entering more than one character

    const otp = inputsRef.current.map(ref => ref.current.value).join('');
    onChangeOTP(otp);

    if (value && index < length - 1) {
      // Move focus to the next input
      inputsRef.current[index + 1].current.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      // Move focus to the previous input
      inputsRef.current[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteValues = paste.split('');

    pasteValues.forEach((value, index) => {
      if (index < length) {
        inputsRef.current[index].current.value = value;
        onChangeOTP(inputsRef.current.map(ref => ref.current.value).join(''));
      }
    });

    if (pasteValues.length < length) {
      inputsRef.current[pasteValues.length].current.focus();
    }
  };

  // Clear inputs when reset prop changes
  useEffect(() => {
    if (reset) {
      inputsRef.current.forEach(ref => {
        ref.current.value = ''; // Clear each input
      });
      onChangeOTP(''); // Clear the OTP state in parent
    }
  }, [reset, onChangeOTP]);

  return (
    <div className="otp-input flex gap-1 sm:gap-2">
      {inputsRef.current.map((ref, index) => (
        <input
          key={index}
          ref={ref}
          type="text"
          maxLength="1"
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className='rounded-xl p-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-dark-blue/80  bg-flash-white shadow-input text-center outline-none focus:ring-2 focus:ring-azure-blue'
          style={customStyle}
        />
      ))}
    </div>
  );
};

export default OTPInput;
