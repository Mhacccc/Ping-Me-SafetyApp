// src/pages/report/ReportExportCard.jsx
// Off-screen component rendered into a canvas by html2canvas and downloaded as PNG.
import { forwardRef } from 'react';
import logoSrc from '../../assets/logo.png';
import './ReportExportCard.css';

function buildMapUrl(position) {
  if (!Array.isArray(position) || position.length < 2) return null;
  const [lat, lng] = position;
  if (isNaN(lat) || isNaN(lng)) return null;
  return (
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${lat},${lng}&zoom=16&size=536x200&markers=${lat},${lng},red-pushpin`
  );
}

const ReportExportCard = forwardRef(function ReportExportCard({ incident }, ref) {
  if (!incident) return null;

  const getLevelLabel = (level) => {
    if (level === 3) return 'Level 3 — Severe';
    if (level === 2) return 'Level 2 — Moderate';
    return 'Level 1 — Mild';
  };

  const refNo = `RPT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const generatedAt = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Use end position (Marked Safe location) for the map
  const mapUrl = buildMapUrl(incident.position);

  // Timeline data — fall back gracefully for legacy reports without start data
  const helpDate     = incident.sosStartDate     || incident.date     || '—';
  const helpTime     = incident.sosStartTime     || incident.time     || '—';
  const helpLocation = incident.sosStartLocation || incident.location || 'Unknown Location';
  const safeDate     = incident.date     || '—';
  const safeTime     = incident.time     || '—';
  const safeLocation = incident.location || 'Unknown Location';

  return (
    <div ref={ref} className="rec-root">

      {/* ── Header ── */}
      <div className="rec-header">
        <div className="rec-brand">
          <div className="rec-logo-wrap">
            <img src={logoSrc} crossOrigin="anonymous" alt="PingMe" className="rec-logo" />
          </div>
        </div>
        <div className="rec-header-right">
          <p className="rec-doc-type">Official Document</p>
          <p className="rec-doc-title">Incident Report</p>
        </div>
      </div>
      <div className="rec-rule" />

      {/* ── Subject ── */}
      <div className="rec-subject">
        <img src={incident.user.avatar} crossOrigin="anonymous" alt={incident.user.name} className="rec-avatar" />
        <div className="rec-subject-info">
          <h2 className="rec-subject-name">{incident.user.name}</h2>
          <span className="rec-status-chip">{incident.displayStatus?.text || 'Marked Safe'}</span>
        </div>
        {/* Incident meta pills beside avatar */}
        <div className="rec-meta-pills">
          <span className="rec-meta-pill">
            <span className="rec-meta-label">Bracelet</span>
            <span className="rec-meta-value">{incident.braceletStatus || '—'}</span>
          </span>
          <span className="rec-meta-pill">
            <span className="rec-meta-label">Level</span>
            <span className="rec-meta-value">{getLevelLabel(incident.sosLevel)}</span>
          </span>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="rec-details">
        <p className="rec-section-label">Incident Timeline</p>

        <div className="rec-timeline">

          {/* Phase 1 — Request for Help */}
          <div className="rec-tl-item">
            <div className="rec-tl-marker rec-tl-sos" />
            <div className="rec-tl-connector" />
            <div className="rec-tl-content">
              <p className="rec-tl-phase rec-tl-phase-sos">🚨 Request for Help</p>
              <div className="rec-tl-grid">
                <div className="rec-field">
                  <span className="rec-field-label">Date</span>
                  <span className="rec-field-value">{helpDate}</span>
                </div>
                <div className="rec-field">
                  <span className="rec-field-label">Time</span>
                  <span className="rec-field-value">{helpTime}</span>
                </div>
                <div className="rec-field rec-field-full">
                  <span className="rec-field-label">Location</span>
                  <span className="rec-field-value">{helpLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 — Marked Safe */}
          <div className="rec-tl-item rec-tl-item-last">
            <div className="rec-tl-marker rec-tl-safe" />
            <div className="rec-tl-content">
              <p className="rec-tl-phase rec-tl-phase-safe">✅ Marked Safe</p>
              <div className="rec-tl-grid">
                <div className="rec-field">
                  <span className="rec-field-label">Date</span>
                  <span className="rec-field-value">{safeDate}</span>
                </div>
                <div className="rec-field">
                  <span className="rec-field-label">Time</span>
                  <span className="rec-field-value">{safeTime}</span>
                </div>
                <div className="rec-field rec-field-full">
                  <span className="rec-field-label">Location</span>
                  <span className="rec-field-value">{safeLocation}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Static Map ── */}
        {mapUrl && (
          <div className="rec-map-section">
            <p className="rec-section-label" style={{ marginTop: 20, marginBottom: 10 }}>
              Location Map
            </p>
            <div className="rec-map-frame">
              <img
                src={mapUrl}
                crossOrigin="anonymous"
                alt="Incident location map"
                className="rec-map-img"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="rec-map-overlay">
                <span className="rec-map-label">📍 Last Known Location</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="rec-footer">
        <span className="rec-footer-left">
          Ref: <span className="rec-footer-accent">{refNo}</span>
        </span>
        <span className="rec-footer-right">
          Generated · {generatedAt} · <span className="rec-footer-accent">PingMe</span>
        </span>
      </div>

    </div>
  );
});

export default ReportExportCard;
