export function initBookingLocation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cfg = window.CONFIG || {};
  const bookingUrl = cfg.booking_url || '';
  const location = cfg.location || '';
  const mapsUrl = cfg.maps_url || (location
    ? 'https://maps.google.com/?q=' + encodeURIComponent(location)
    : '');
  const accent = cfg.color || '#6366f1';

  if (!bookingUrl && !location) return;

  const styles = `
    .booking-section { display: flex; flex-direction: column; gap: 8px; width: 100%; }
    .booking-btn, .location-btn {
      display: flex; align-items: center; gap: 10px;
      width: 100%; height: 48px; border-radius: 12px; border: none; cursor: pointer;
      font-size: 14px; font-weight: 600; padding: 0 16px;
      transition: transform 200ms, box-shadow 200ms;
      text-decoration: none;
    }
    .booking-btn:hover, .location-btn:hover {
      transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .booking-btn-icon, .location-btn-icon { font-size: 18px; flex-shrink: 0; }
  `;

  if (!document.getElementById('booking-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'booking-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  let html = '<div class="booking-section">';

  if (bookingUrl) {
    html += `<a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" class="booking-btn"
      style="background:${accent}26;border:1px solid ${accent}66;color:${accent}">
      <span class="booking-btn-icon">&#128197;</span>
      <span>Book a Meeting</span>
    </a>`;
  }

  if (location && mapsUrl) {
    html += `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="location-btn"
      style="background:#05966926;border:1px solid #05966966;color:#059669">
      <span class="location-btn-icon">&#128205;</span>
      <span>${location}</span>
    </a>`;
  }

  html += '</div>';
  container.innerHTML = html;
}