const SOCIAL_PLATFORMS = {
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
  },
  instagram: {
    name: 'Instagram',
    color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>'
  },
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
  },
  twitter: {
    name: 'X (Twitter)',
    color: '#0a0a0f',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
  },
  tiktok: {
    name: 'TikTok',
    color: '#010101',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>'
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  },
  pinterest: {
    name: 'Pinterest',
    color: '#E60023',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>'
  }
};

function initInteractiveLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const config = window.CONFIG || {};
  const social = config.social || {};
  const customLinks = config.custom_links || [];

  const activeSocialPlatforms = Object.keys(SOCIAL_PLATFORMS).filter(
    platform => social[platform] && social[platform].trim() !== ''
  );

  let socialHTML = '';
  if (activeSocialPlatforms.length > 0) {
    const socialButtons = activeSocialPlatforms.map(platform => {
      const platformData = SOCIAL_PLATFORMS[platform];
      const url = social[platform];
      const isGradient = platformData.color.startsWith('linear-gradient');

      return `
        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link-btn"
          data-platform="${platform}"
          style="${isGradient ? `background: ${platformData.color};` : `background-color: ${platformData.color};`}"
          aria-label="${platformData.name}"
        >
          ${platformData.icon}
        </a>
      `;
    }).join('');

    socialHTML = `
      <div class="social-links-section">
        <div class="social-links-grid">
          ${socialButtons}
        </div>
      </div>
    `;
  }

  let customLinksHTML = '';
  if (customLinks.length > 0) {
    const customButtons = customLinks.map(link => {
      const bgColor = link.color || '#6366f1';
      return `
        <a
          href="${link.url}"
          target="_blank"
          rel="noopener noreferrer"
          class="custom-link-btn"
          style="background-color: ${bgColor};"
        >
          ${link.label}
        </a>
      `;
    }).join('');

    customLinksHTML = `
      <div class="custom-links-section">
        ${customButtons}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="interactive-links-container">
      ${socialHTML}
      ${customLinksHTML}
    </div>
  `;

  if (!document.getElementById('interactive-links-styles')) {
    const style = document.createElement('style');
    style.id = 'interactive-links-styles';
    style.textContent = `
      .interactive-links-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .social-links-section {
        width: 100%;
      }

      .social-links-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
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
        transition: transform 0.2s ease;
        cursor: pointer;
        border: none;
        flex-shrink: 0;
      }

      .social-link-btn svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }

      .social-link-btn:hover {
        transform: scale(1.08);
      }

      .social-link-btn:active {
        transform: scale(0.98);
      }

      .custom-links-section {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 12px;
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
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
        border: none;
      }

      .custom-link-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }

      .custom-link-btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .interactive-links-container {
          gap: 20px;
        }

        .social-links-grid {
          gap: 8px;
        }

        .custom-links-section {
          gap: 8px;
        }
      }

      @media (max-width: 380px) {
        .social-link-btn {
          width: 44px;
          height: 44px;
        }

        .custom-link-btn {
          font-size: 14px;
          height: 44px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

if (typeof window !== 'undefined' && window.CONFIG) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('[data-interactive-links]');
      if (container) {
        initInteractiveLinks(container.id);
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initInteractiveLinks };
}
