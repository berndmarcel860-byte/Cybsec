import React from 'react';
import Draggable from 'react-draggable'; // For drag functionality

const DraggableModal = ({ children, onClose, title }) => {
    return (
        <div className="modal-background" onClick={onClose}>
            <Draggable handle=".modal-header">
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

export default DraggableModal;
