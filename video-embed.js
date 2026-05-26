export function initVideoEmbed(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.CONFIG?.video_url) return;

  function extractVideoId(url) {
    if (!url) return null;

    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const vimeoRegex = /vimeo\.com\/(\d+)/;

    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { platform: 'youtube', id: youtubeMatch[1] };
    }

    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { platform: 'vimeo', id: vimeoMatch[1] };
    }

    return null;
  }

  const videoData = extractVideoId(window.CONFIG.video_url);
  if (!videoData) return;

  const styles = `
    .video-embed-container {
      margin-top: 16px;
    }

    .video-embed-label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-accent, #6366f1);
      font-weight: 700;
      margin-bottom: 8px;
    }

    .video-embed-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #111827;
      cursor: pointer;
    }

    .video-embed-card.playing {
      cursor: default;
    }

    .video-embed-thumbnail {
      position: relative;
      width: 100%;
      padding-top: 56.25%;
      background: #0a0a0f;
      overflow: hidden;
    }

    .video-embed-thumbnail-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-embed-gradient {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      opacity: 0.6;
    }

    .video-embed-play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 56px;
      height: 56px;
      background: rgba(10, 10, 15, 0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 200ms, transform 200ms;
      pointer-events: none;
    }

    .video-embed-card:hover .video-embed-play-btn {
      transform: translate(-50%, -50%) scale(1.1);
    }

    .video-embed-play-icon {
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 10px 0 10px 16px;
      border-color: transparent transparent transparent #ffffff;
      margin-left: 4px;
    }

    .video-embed-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    .video-embed-caption {
      margin-top: 8px;
      font-size: 12px;
      color: var(--color-muted, #9ca3af);
      font-weight: 400;
    }

    @media (max-width: 768px) {
      .video-embed-play-btn {
        width: 48px;
        height: 48px;
      }

      .video-embed-play-icon {
        border-width: 8px 0 8px 14px;
      }
    }

    @media (max-width: 380px) {
      .video-embed-container {
        margin-top: 12px;
      }

      .video-embed-play-btn {
        width: 44px;
        height: 44px;
      }
    }
  `;

  if (!document.getElementById('video-embed-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'video-embed-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  let html = `
    <div class="video-embed-container">
      <span class="video-embed-label">Watch</span>
      <div class="video-embed-card" id="video-embed-player">
        <div class="video-embed-thumbnail">
  `;

  if (videoData.platform === 'youtube') {
    html += `<img class="video-embed-thumbnail-img" src="https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg" alt="Video thumbnail" loading="lazy">`;
  } else {
    html += `<div class="video-embed-gradient"></div>`;
  }

  html += `
          <div class="video-embed-play-btn">
            <div class="video-embed-play-icon"></div>
          </div>
        </div>
      </div>
  `;

  if (window.CONFIG.video_caption) {
    html += `<div class="video-embed-caption">${window.CONFIG.video_caption}</div>`;
  }

  html += `</div>`;

  container.innerHTML = html;

  const card = document.getElementById('video-embed-player');
  const thumbnail = card.querySelector('.video-embed-thumbnail');
  let isPlaying = false;

  card.addEventListener('click', () => {
    if (isPlaying) return;

    isPlaying = true;
    card.classList.add('playing');

    let embedUrl = '';
    if (videoData.platform === 'youtube') {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoData.id}?autoplay=1&rel=0`;
    } else if (videoData.platform === 'vimeo') {
      embedUrl = `https://player.vimeo.com/video/${videoData.id}?autoplay=1`;
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'video-embed-iframe';
    iframe.src = embedUrl;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = 'Video player';

    thumbnail.innerHTML = '';
    thumbnail.appendChild(iframe);
  });
}
