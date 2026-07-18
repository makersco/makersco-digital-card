export function initBookingLocation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const CONFIG = window.CONFIG || {};
  
  const hasBooking = Boolean(CONFIG.booking_url);
  const hasLocation = Boolean(CONFIG.location);
  
  if (!hasBooking && !hasLocation) {
    container.style.display = 'none';
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  `;

  if (hasBooking) {
    const bookingBtn = createButton({
      icon: '📅',
      text: 'Book a Meeting',
      accentColor: CONFIG.accent_color || '#3b82f6',
      onClick: () => window.open(CONFIG.booking_url, '_blank', 'noopener,noreferrer')
    });
    wrapper.appendChild(bookingBtn);
  }

  if (hasLocation) {
    const locationUrl = CONFIG.maps_url || `https://maps.google.com/?q=${encodeURIComponent(CONFIG.location)}`;
    const locationBtn = createButton({
      icon: '📍',
      text: CONFIG.location,
      accentColor: '#10b981',
      onClick: () => window.open(locationUrl, '_blank', 'noopener,noreferrer')
    });
    wrapper.appendChild(locationBtn);
  }

  container.appendChild(wrapper);
}

function createButton({ icon, text, accentColor, onClick }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', text);
  
  const rgb = hexToRgb(accentColor);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
  const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  const hoverBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
  
  btn.style.cssText = `
    width: 100%;
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 12px;
    background: ${bgColor};
    border: 1px solid ${borderColor};
    color: inherit;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: opacity 200ms ease, transform 200ms ease;
    -webkit-tap-highlight-color: transparent;
  `;

  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  iconSpan.style.cssText = `
    font-size: 18px;
    line-height: 1;
  `;

  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  textSpan.style.cssText = `
    line-height: 1.4;
  `;

  btn.appendChild(iconSpan);
  btn.appendChild(textSpan);

  btn.addEventListener('mouseenter', () => {
    btn.style.background = hoverBg;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.background = bgColor;
  });

  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'scale(0.98)';
    btn.style.opacity = '0.9';
  });

  btn.addEventListener('mouseup', () => {
    btn.style.transform = 'scale(1)';
    btn.style.opacity = '1';
  });

  btn.addEventListener('touchstart', () => {
    btn.style.transform = 'scale(0.98)';
    btn.style.opacity = '0.9';
  }, { passive: true });

  btn.addEventListener('touchend', () => {
    btn.style.transform = 'scale(1)';
    btn.style.opacity = '1';
  }, { passive: true });

  btn.addEventListener('click', onClick);

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