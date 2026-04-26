import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';


const HCaptchaPage = () => {
    const siteKey = process.env.REACT_APP_CAPTCHA_SECRET;
    console.log(siteKey);
    const handleVerification = (token) => {
        console.log('hCaptcha token:', token);
        localStorage.setItem("captchaToken", token);
        window.location.href = '/'; 
        // You can send the token to your backend for verification if needed
    };

    return (
        <div className="captcha-container">
            <HCaptcha
                sitekey={siteKey}
                onVerify={handleVerification}
            />
        </div>
    );
};

export default HCaptchaPage;
