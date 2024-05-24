import React, { useState, useEffect, useRef } from 'react';
import { Icon } from "@iconify/react";

const OtpForm = ({ onVerify }) => {
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const emailInputs = useRef([]);

  useEffect(() => {
    emailInputs.current[0].focus();
  }, []);

  const handleOtpChange = (index, value, otp, setOtp, inputs) => {
    if (!/^\d$/.test(value) && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].removeAttribute('disabled');
      inputs.current[index + 1].focus();
    }

    if (index === 5 && value) {
      inputs.current[5].focus();
    }
  };

  const handlePaste = (event, setOtp, inputs) => {
    const clip = event.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(clip)) {
      event.preventDefault();
      return;
    }

    const characters = clip.split('');
    const newOtp = characters.slice(0, 6);
    setOtp(newOtp);

    newOtp.forEach((char, i) => {
      inputs.current[i].value = char;
      if (i < 5) inputs.current[i + 1].removeAttribute('disabled');
    });

    inputs.current[5].focus();
  };

  const handleKeyDown = (event, index, inputs) => {
    if (event.key === 'Backspace' && index > 0 && !inputs.current[index].value) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = (otp) => {
    const otpValue = otp.join('');
    onVerify(otpValue);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col justify-center align-middle items-center gap-5">
        <p className=" flex gap-5 justify-center align-middle items-center text-md text-gray-400"><Icon icon={'arcticons:otp-authenticator'} fontSize={'32px'} /> Enter OTP sent to the given mail.</p>
        <form>
        <div className="flex justify-center space-x-2">
            {emailOtp.map((value, index) => (
            <input
                key={index}
                type="text"
                className="w-10 h-10 text-center text-xl border border-gray-500 rounded focus:outline-none focus:border-blue-500"
                pattern="\d"
                maxLength="1"
                value={value}
                ref={(el) => (emailInputs.current[index] = el)}
                onChange={(e) => handleOtpChange(index, e.target.value, emailOtp, setEmailOtp, emailInputs)}
                onKeyDown={(e) => handleKeyDown(e, index, emailInputs)}
                onPaste={(e) => handlePaste(e, setEmailOtp, emailInputs)}
                disabled={index !== 0 && !emailOtp[index - 1]}
                autoFocus
            />
            ))}
        </div>
        <input
            type="text"
            id="emailverificationCode"
            placeholder="Enter verification code"
            value={emailOtp.join('')}
            onChange={handleVerify(emailOtp)}
            readOnly
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 mb-4 hidden"
        />
        </form>
    </div>
  );
};

export default OtpForm;
