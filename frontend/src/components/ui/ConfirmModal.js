import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger', 'primary', 'warning'
  icon = "fas fa-exclamation-triangle",
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getButtonClass = () => {
    switch (confirmVariant) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      case "primary":
        return "btn-primary";
      default:
        return "btn-danger";
    }
  };

  const getIconColor = () => {
    switch (confirmVariant) {
      case "danger":
        return "text-danger";
      case "warning":
        return "text-warning";
      case "primary":
        return "text-primary";
      default:
        return "text-danger";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="confirm-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleBackdropClick}
      >
        <motion.div
          className="confirm-modal-content"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="confirm-modal-header">
            <div className={`confirm-modal-icon ${getIconColor()}`}>
              <i className={icon}></i>
            </div>
            <h5 className="confirm-modal-title">{title}</h5>
          </div>

          <div className="confirm-modal-body">
            <p>{message}</p>
          </div>

          <div className="confirm-modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <motion.button
              type="button"
              className={`btn ${getButtonClass()}`}
              onClick={onConfirm}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
