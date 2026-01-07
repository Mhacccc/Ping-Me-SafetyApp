import { X } from 'lucide-react';
import './ReportDetailModal.css';

const ReportDetailModal = ({ incident, onClose }) => {
  if (!incident) {
    return null;
  }

  const DetailRow = ({ label, value }) => (
    <div className="report-detail-modal-row">
      <span className="report-detail-modal-label">{label}</span>
      <span className="report-detail-modal-value">{value}</span>
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{incident.displayStatus.text}</h2>
          <button className="modal-close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="report-detail-modal-body">
            <section className="profile-hero">
                <div className="profile-avatar-wrapper">
                <img
                    src={incident.user.avatar}
                    alt={`${incident.user.name}'s profile`}
                    className="profile-avatar-img"
                />
                </div>
                <h1 className="profile-name">{incident.user.name}</h1>
            </section>
            <section className="profile-section">
                <h2 className="profile-section-title">Incident Details</h2>
                <div className="profile-list-container">
                    <DetailRow label="Date" value={incident.date} />
                    <DetailRow label="Time" value={incident.time} />
                    <DetailRow label="Location" value={incident.location} />
                    <DetailRow label="Pulse Reading" value={incident.pulse} />
                    <DetailRow label="Bracelet Status" value={incident.braceletStatus} />
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
