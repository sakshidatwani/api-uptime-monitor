import React from 'react';

/**
 * A generic, reusable Modal component.
 * It uses a portal to render outside the main DOM hierarchy, which is best practice.
 * For simplicity in this step, we'll render it inline.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {Function} props.onClose - A callback function to be called when the modal should be closed.
 * @param {React.ReactNode} props.children - The content to be displayed inside the modal.
 */
function Modal({ isOpen, onClose, children }) {
  // If the modal is not open, we render nothing (null).
  if (!isOpen) {
    return null;
  }

  // A key UX feature: prevent clicks inside the modal content from closing it.
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // The overlay div covers the entire screen and has a semi-transparent background.
    // Clicking the overlay will close the modal by calling the `onClose` function.
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        {/* A close button in the top-right corner. */}
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {/* The 'children' prop allows us to render any content passed into the Modal. */}
        {children}
      </div>
    </div>
  );
}

export default Modal;