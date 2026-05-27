function extractVideoId(url) {
  if (!url) return null;

  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[1] };
  }

  // Vimeo pattern
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return { platform: 'vimeo', id: vimeoMatch[1] };
  }

  return null;
}

function createVideoThumbnail(videoData) {
  const thumbnail = document.createElement('div');
  thumbnail.style.cssText = `
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    overflow: hidden;
  `;

  if (videoData.platform === 'youtube') {
    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`;
    img.alt = 'Video thumbnail';
    img.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    `;
    thumbnail.appendChild(img);
  }

  const playButton = document.createElement('div');
  playButton.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 56px;
    height: 56px;
    background: rgba(0, 0, 0, 0.72);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);
  `;

  playButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.14v13.72L19 12L8 5.14z" fill="white"/>
    </svg>
  `;

  playButton.addEventListener('mouseenter', () => {
    playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
  });

  playButton.addEventListener('mouseleave', () => {
    playButton.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  thumbnail.appendChild(playButton);

  return thumbnail;
}

function createIframe(videoData) {
  const iframeContainer = document.createElement('div');
  iframeContainer.style.cssText = `
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #0a0a0f;
  `;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  `;

  if (videoData.platform === 'youtube') {
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoData.id}?autoplay=1&rel=0`;
  } else if (videoData.platform === 'vimeo') {
    iframe.src = `https://player.vimeo.com/video/${videoData.id}?autoplay=1`;
  }

  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  iframeContainer.appendChild(iframe);

  return iframeContainer;
}

export function initVideoEmbed(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (typeof CONFIG === 'undefined' || !CONFIG.video_url) {
    container.style.display = 'none';
    return;
  }

  const videoData = extractVideoId(CONFIG.video_url);
  if (!videoData) {
    container.style.display = 'none';
    return;
  }

  container.style.cssText = `
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 16px;
    padding: 16px;
  `;

  const label = document.createElement('div');
  label.textContent = 'WATCH';
  label.style.cssText = `
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent-color, #6366f1);
    margin-bottom: 12px;
  `;
  container.appendChild(label);

  const videoArea = document.createElement('div');
  videoArea.style.cssText = `
    border-radius: 8px;
    overflow: hidden;
  `;

  const thumbnail = createVideoThumbnail(videoData);
  videoArea.appendChild(thumbnail);

  thumbnail.addEventListener('click', () => {
    const iframe = createIframe(videoData);
    videoArea.innerHTML = '';
    videoArea.appendChild(iframe);
  });

  container.appendChild(videoArea);

  if (CONFIG.video_caption) {
    const caption = document.createElement('div');
    caption.textContent = CONFIG.video_caption;
    caption.style.cssText = `
      margin-top: 12px;
      font-size: 13px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.5;
    `;
    container.appendChild(caption);
  }
}
