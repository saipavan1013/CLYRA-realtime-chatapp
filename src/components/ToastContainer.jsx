import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

function ToastContainer() {
    const { toasts, removeToast } = useNotifications();
    const navigate = useNavigate();

    if (toasts.length === 0) return null;

    const handleToastClick = (toast) => {
        // Navigate strictly to the chat
        navigate('/chat?uid=' + toast.senderId); // Assuming we can navigate by UID or handling chat selection via existing logic
        // Actually, our ChatPage uses internal state selection. 
        // We might need to handle 'selecting the user' global state or just navigate to /chat 
        // and let the user find it, OR update how ChatPage handles selection via URL params.
        // For now, let's just go to /chat.
        navigate('/chat');
        removeToast(toast.id);
    };

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="toast-notification"
                    onClick={() => handleToastClick(toast)}
                >
                    <div className="toast-content">
                        <div className="toast-header">
                            <span className="toast-sender">{toast.senderName}</span>
                            <span className="toast-now">Now</span>
                        </div>
                        <p className="toast-message">
                            {toast.type === 'image' ? '📷 Photo' :
                                toast.type === 'video' ? '🎥 Video' :
                                    toast.type === 'audio' ? '🎤 Audio' :
                                        toast.text}
                        </p>
                    </div>
                    <button
                        className="toast-close"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.id);
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;
