export function initSocialLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cfg = window.CONFIG || {};
  const social = cfg.social || {};
  const customLinks = cfg.custom_links || [];
  const accent = cfg.color || '#6366f1';

  const platforms = [
    {
      key: 'linkedin', color: '#0A66C2', label: 'LinkedIn',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    },
    {
      key: 'instagram', color: '#E1306C', label: 'Instagram',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
    },
    {
      key: 'facebook', color: '#1877F2', label: 'Facebook',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    },
    {
      key: 'twitter', color: '#000000', label: 'X / Twitter',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    },
    {
      key: 'tiktok', color: '#010101', label: 'TikTok',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>',
    },
    {
      key: 'youtube', color: '#FF0000', label: 'YouTube',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
    },
    {
      key: 'pinterest', color: '#E60023', label: 'Pinterest',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>',
    },
  ];

  const styles = `
    .social-links-section { width: 100%; }
    .social-icons-row {
      display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 12px;
    }
    .social-icon-btn {
      width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0; color: #fff; text-decoration: none;
    }
    .social-icon-btn:hover { transform: scale(1.08); }
    .custom-links-list { display: flex; flex-direction: column; gap: 8px; }
    .custom-link-btn {
      display: flex; align-items: center; justify-content: center;
      width: 100%; height: 48px; border-radius: 12px; border: none; cursor: pointer;
      font-size: 14px; font-weight: 600; color: #fff; padding: 0 16px;
      transition: transform 200ms, box-shadow 200ms;
      text-decoration: none;
    }
    .custom-link-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
  `;

  if (!document.getElementById('social-links-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'social-links-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  const activePlatforms = platforms.filter(p => social[p.key]);
  const hasCustomLinks = customLinks.length > 0;

  if (!activePlatforms.length && !hasCustomLinks) return;

  let html = '<div class="social-links-section">';

  if (activePlatforms.length) {
    html += '<div class="social-icons-row">';
    for (const p of activePlatforms) {
      html += `<a href="${social[p.key]}" target="_blank" rel="noopener noreferrer"
        aria-label="${p.label}" class="social-icon-btn" style="background:${p.color}">${p.icon}</a>`;
    }
    html += '</div>';
  }

  if (hasCustomLinks) {
    html += '<div class="custom-links-list">';
    for (const link of customLinks) {
      const bg = link.color || accent;
      html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer"
        class="custom-link-btn" style="background:${bg}">${link.label}</a>`;
    }
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}