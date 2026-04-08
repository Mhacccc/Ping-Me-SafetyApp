// src/components/ReloadPrompt.jsx
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCcw, X } from 'lucide-react';
import './ReloadPrompt.css';

const ReloadPrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="reload-prompt-overlay">
      <div className="reload-prompt-container">
        <div className="reload-prompt-content">
          <RefreshCcw size={20} className="reload-prompt-icon" />
          <div className="reload-prompt-text">
            <h4>Update Available</h4>
            <p>A new version is ready.</p>
          </div>
        </div>
        <div className="reload-prompt-actions">
          <button className="rp-btn-update" onClick={() => updateServiceWorker(true)}>
            Refresh
          </button>
          <button className="rp-btn-close" onClick={close}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReloadPrompt;
