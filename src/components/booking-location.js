export function initBookingLocation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `;

  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim() || '#6366f1';

  if (window.CONFIG.booking_url) {
    const bookingBtn = createButton(
      '📅',
      'Book a Meeting',
      window.CONFIG.booking_url,
      accentColor
    );
    wrapper.appendChild(bookingBtn);
  }

  if (window.CONFIG.location) {
    const mapsUrl = window.CONFIG.maps_url || 
      `https://maps.google.com/?q=${encodeURIComponent(window.CONFIG.location)}`;
    const locationBtn = createButton(
      '📍',
      window.CONFIG.location,
      mapsUrl,
      '#10b981'
    );
    wrapper.appendChild(locationBtn);
  }

  if (wrapper.children.length > 0) {
    container.appendChild(wrapper);
  }
}

function createButton(icon, label, url, baseColor) {
  const btn = document.createElement('a');
  btn.href = url;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  
  const rgb = hexToRgb(baseColor);
  
  btn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15);
    border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4);
    color: ${baseColor};
    font-weight: 600;
    font-size: 15px;
    text-decoration: none;
    transition: transform 200ms, opacity 200ms;
    cursor: pointer;
  `;

  btn.innerHTML = `
    <span style="font-size: 18px; line-height: 1;">${icon}</span>
    <span>${label}</span>
  `;

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-2px)';
    btn.style.opacity = '0.9';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
    btn.style.opacity = '1';
  });

  return btn;
}

function hexToRgb(hex) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}