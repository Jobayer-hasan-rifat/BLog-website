import React from 'react';
import '../styles/Modal.css';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal__backdrop" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;


