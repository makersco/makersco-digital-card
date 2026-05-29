The existing component already implements all your requirements. Here's the cleaned output with minor refinements for strict design rule compliance:

```javascript
function extractVideoId(url) {
  if (!url) return null;
  
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }
  
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] };
  }
  
  return null;
}

function getYouTubeThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getVimeoPlaceholder() {
  return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
}

function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
}

function getVimeoEmbedUrl(videoId) {
  return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
}

function createPlayButton() {
  const button = document.createElement('button');
  button.className = 'video-play-button';
  button.setAttribute('aria-label', 'Play video');
  
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.14v13.72L19 12L8 5.14z" fill="currentColor"/>
    </svg>
  `;
  
  return button;
}

function createVideoThumbnail(videoInfo) {
  const thumbnail = document.createElement('div');
  thumbnail.className = 'video-thumbnail';
  
  if (videoInfo.platform === 'youtube') {
    const img = document.createElement('img');
    img.src = getYouTubeThumbnailUrl(videoInfo.id);
    img.alt = 'Video thumbnail';
    img.loading = 'lazy';
    thumbnail.appendChild(img);
  } else {
    thumbnail.style.background = getVimeoPlaceholder();
  }
  
  const playButton = createPlayButton();
  thumbnail.appendChild(playButton);
  
  return thumbnail;
}

function createVideoIframe(videoInfo) {
  const iframe = document.createElement('iframe');
  iframe.className = 'video-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  
  if (videoInfo.platform === 'youtube') {
    iframe.src = getYouTubeEmbedUrl(videoInfo.id);
  } else if (videoInfo.platform === 'vimeo') {
    iframe.src = getVimeoEmbedUrl(videoInfo.id);
  }
  
  return iframe;
}

function createStyles() {
  const styleId = 'video-embed-styles';
  
  if (document.getElementById(styleId)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .video-embed-container {
      margin-top: 16px;
      border-radius: 12px;
      overflow: hidden;
      background: #0b0f1a;
    }
    
    .video-embed-header {
      padding: 12px 16px 8px;
    }
    
    .video-embed-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--accent-color, #6366f1);
      margin: 0;
    }
    
    .video-aspect-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #111827;
    }
    
    .video-thumbnail {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .video-thumbnail img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-play-button {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      border: none;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease, opacity 0.2s ease;
      z-index: 1;
    }
    
    .video-play-button:hover {
      transform: scale(1.1);
      opacity: 0.9;
    }
    
    .video-play-button:active {
      transform: scale(1.05);
    }
    
    .video-play-button svg {
      margin-left: 2px;
    }
    
    .video-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .video-caption {
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .video-embed-container {
        margin-top: 12px;
        border-radius: 8px;
      }
      
      .video-embed-header {
        padding: 8px 12px 4px;
      }
      
      .video-play-button {
        width: 48px;
        height: 48px;
      }
      
      .video-caption {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
    
    @media (max-width: 380px) {
      .video-play-button {
        width: 44px;
        height: 44px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

function initVideoEmbed(containerId) {
  if (typeof CONFIG === 'undefined' || !CONFIG.video_url) {
    return;
  }
  
  const videoInfo = extractVideoId(CONFIG.video_url);
  if (!videoInfo) {
    console.warn('Invalid video URL format:', CONFIG.video_url);
    return;
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('Video container not found:', containerId);
    return;
  }
  
  createStyles();
  
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-embed-container';
  
  const header = document.createElement('div');
  header.className = 'video-embed-header';
  
  const label = document.createElement('p');
  label.className = 'video-embed-label';
  label.textContent = 'Watch';
  header.appendChild(label);
  
  const aspectWrapper = document.createElement('div');
  aspectWrapper.className = 'video-aspect-wrapper';
  
  const thumbnail = createVideoThumbnail(videoInfo);
  aspectWrapper.appendChild(thumbnail);
  
  thumbnail.addEventListener('click', function() {
    const iframe = createVideoIframe(videoInfo);
    aspectWrapper.innerHTML = '';
    aspectWrapper.appendChild(iframe);
  });
  
  videoContainer.appendChild(header);
  videoContainer.appendChild(aspectWrapper);
  
  if (CONFIG.video_caption) {
    const caption = document.createElement('p');
    caption.className = 'video-caption';
    caption.textContent = CONFIG.video_caption;
    videoContainer.appendChild(caption);
  }
  
  container.appendChild(videoContainer);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initVideoEmbed, extractVideoId };
}
```

Component already exists at src/components/video-embed.js with full compliance: 16:9 ratio, 12px border-radius, click-to-play (no autoload), YouTube nocookie embed, transform+opacity-only animations under 200ms, 44px minimum touch target at 380px, 4px/8px spacing grid, and 700 weight labels.