// interactive-links.js - Social media + custom links component
// Reads from window.CONFIG.social and window.CONFIG.custom_links

const socialIcons = {
  linkedin: '<svg viewBox="0 0 24 24" fill="none"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/></svg>',
  
  instagram: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/></svg>',
  
  facebook: '<svg viewBox="0 0 24 24" fill="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="currentColor"/></svg>',
  
  twitter: '<svg viewBox="0 0 24 24" fill="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/></svg>',
  
  tiktok: '<svg viewBox="0 0 24 24" fill="none"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="currentColor"/></svg>',
  
  youtube: '<svg viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/></svg>',
  
  pinterest: '<svg viewBox="0 0 24 24" fill="none"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" fill="currentColor"/></svg>'
};

const brandColors = {
  linkedin: '#0A66C2',
  instagram: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
  facebook: '#1877F2',
  twitter: '#000000',
  tiktok: '#010101',
  youtube: '#FF0000',
  pinterest: '#E60023'
};

function initInteractiveLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  const config = window.CONFIG || {};
  const social = config.social || {};
  const customLinks = config.custom_links || [];

  // Filter social platforms that have URLs
  const activeSocial = Object.keys(social)
    .filter(platform => social[platform] && social[platform].trim() !== '')
    .filter(platform => socialIcons[platform]);

  // Build HTML
  let html = '<div class="interactive-links-wrapper">';

  // Social links section
  if (activeSocial.length > 0) {
    html += '<div class="social-links-section">';
    activeSocial.forEach(platform => {
      const isGradient = platform === 'instagram';
      const bgStyle = isGradient 
        ? `background: ${brandColors[platform]};` 
        : `background-color: ${brandColors[platform]};`;
      
      html += `
        <a href="${social[platform]}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="social-link-btn"
           style="${bgStyle}"
           aria-label="${platform}">
          ${socialIcons[platform]}
        </a>
      `;
    });
    html += '</div>';
  }

  // Custom links section
  if (customLinks.length > 0) {
    html += '<div class="custom-links-section">';
    customLinks.forEach(link => {
      if (link.url && link.label) {
        const bgColor = link.color || '#6366f1';
        html += `
          <a href="${link.url}" 
             target="_blank" 
             rel="noopener noreferrer"
             class="custom-link-btn"
             style="background-color: ${bgColor};">
            ${link.label}
          </a>
        `;
      }
    });
    html += '</div>';
  }

  html += '</div>';

  // Inject styles
  if (!document.getElementById('interactive-links-styles')) {
    const style = document.createElement('style');
    style.id = 'interactive-links-styles';
    style.textContent = `
      .interactive-links-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        margin-top: 24px;
      }

      .social-links-section {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        align-items: center;
      }

      .social-link-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        text-decoration: none;
        transition: transform 200ms ease;
        cursor: pointer;
        flex-shrink: 0;
      }

      .social-link-btn svg {
        width: 20px;
        height: 20px;
      }

      .social-link-btn:hover {
        transform: scale(1.08);
      }

      .social-link-btn:active {
        transform: scale(1.02);
      }

      .custom-links-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }

      .custom-link-btn {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
        transition: transform 200ms ease, box-shadow 200ms ease;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }

      .custom-link-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .custom-link-btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      }

      @media (max-width: 380px) {
        .social-links-section {
          gap: 8px;
        }
        
        .custom-links-section {
          gap: 8px;
        }
      }

      @media (min-width: 768px) {
        .interactive-links-wrapper {
          gap: 28px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Inject HTML
  container.innerHTML = html;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initInteractiveLinks };
}