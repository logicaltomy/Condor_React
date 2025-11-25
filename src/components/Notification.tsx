import React, { useEffect } from 'react';

type NotificationProps = {
  type: 'success' | 'danger' | 'info';
  message: string;
  onClose?: () => void;
  timeout?: number; // ms
};

const Notification: React.FC<NotificationProps> = ({ type, message, onClose, timeout = 4000 }) => {
  useEffect(() => {
    if (!onClose) return;
    const t = setTimeout(() => onClose(), timeout);
    return () => clearTimeout(t);
  }, [onClose, timeout]);

  const className =
    type === 'success' ? 'alert alert-success' : type === 'danger' ? 'alert alert-danger' : 'alert alert-info';

  return (
    <div className={className} role="alert" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050, minWidth: 260 }}>
      {message}
      {onClose && (
        <button type="button" className="close" aria-label="Close" onClick={onClose} style={{ border: 'none', background: 'transparent', float: 'right' }}>
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
};

export default Notification;
