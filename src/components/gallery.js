export function initGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!window.CONFIG || !window.CONFIG.gallery || window.CONFIG.gallery.length === 0) {
    container.style.display = 'none';
    return;
  }

  const images = window.CONFIG.gallery.slice(0, 5);
  let currentLightboxIndex = 0;

  const styles = document.createElement('style');
  styles.textContent = `
    .gallery-wrapper {
      width: 100%;
      padding: 0;
      margin: 0;
    }

    .gallery-grid {
      display: grid;
      gap: 12px;
      width: 100%;
    }

    .gallery-grid.single {
      grid-template-columns: 1fr;
    }

    .gallery-grid.double {
      grid-template-columns: 1fr 1fr;
    }

    .gallery-grid.multi .gallery-item:first-child {
      grid-column: 1 / -1;
    }

    .gallery-grid.multi {
      grid-template-columns: 1fr 1fr;
    }

    .gallery-item {
      position: relative;
      width: 100%;
      cursor: pointer;
      border-radius: 10px;
      overflow: hidden;
      background: var(--color-accent, #4f46e5);
      opacity: 0.2;
      transition: opacity 200ms ease, transform 200ms ease;
    }

    .gallery-item:hover {
      transform: scale(1.02);
    }

    .gallery-item:active {
      transform: scale(0.98);
    }

    .gallery-item-inner {
      position: relative;
      width: 100%;
      padding-bottom: 66.67%;
      background: var(--color-accent, #4f46e5);
      opacity: 0.2;
    }

    .gallery-item.loaded .gallery-item-inner {
      background: transparent;
      opacity: 1;
    }

    .gallery-item.loaded {
      opacity: 1;
    }

    .gallery-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 300ms ease;
    }

    .gallery-image.visible {
      opacity: 1;
    }

    .gallery-caption {
      margin-top: 8px;
      font-size: 12px;
      line-height: 16px;
      color: var(--color-text-muted, #94a3b8);
      font-weight: 400;
      text-align: center;
    }

    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 15, 0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 280ms ease;
    }

    .lightbox.active {
      opacity: 1;
      pointer-events: all;
    }

    .lightbox-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: scale(0.9);
      transition: transform 280ms ease;
    }

    .lightbox.active .lightbox-content {
      transform: scale(1);
    }

    .lightbox-image {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 10px;
    }

    .lightbox-caption {
      margin-top: 16px;
      font-size: 14px;
      line-height: 20px;
      color: #e2e8f0;
      font-weight: 400;
      text-align: center;
      max-width: 600px;
    }

    .lightbox-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      color: #ffffff;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 200ms ease, transform 200ms ease;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 0;
    }

    .lightbox-close:hover {
      opacity: 0.8;
      transform: scale(1.1);
    }

    .lightbox-close:active {
      transform: scale(0.95);
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      color: #ffffff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 200ms ease, transform 200ms ease;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 0;
    }

    .lightbox-nav:hover {
      opacity: 0.8;
    }

    .lightbox-nav:active {
      transform: translateY(-50%) scale(0.95);
    }

    .lightbox-nav.prev {
      left: 20px;
    }

    .lightbox-nav.next {
      right: 20px;
    }

    .lightbox-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    body.lightbox-open {
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .lightbox-close {
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
      }

      .lightbox-nav {
        width: 40px;
        height: 40px;
      }

      .lightbox-nav.prev {
        left: 12px;
      }

      .lightbox-nav.next {
        right: 12px;
      }

      .lightbox-caption {
        font-size: 13px;
        line-height: 18px;
        padding: 0 16px;
      }
    }

    @media (max-width: 380px) {
      .gallery-grid.double {
        grid-template-columns: 1fr;
      }

      .gallery-grid.multi {
        grid-template-columns: 1fr;
      }

      .gallery-grid.multi .gallery-item:first-child {
        grid-column: 1;
      }
    }
  `;

  if (!document.querySelector('style[data-gallery-styles]')) {
    styles.setAttribute('data-gallery-styles', '');
    document.head.appendChild(styles);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'gallery-wrapper';

  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  if (images.length === 1) {
    grid.classList.add('single');
  } else if (images.length === 2) {
    grid.classList.add('double');
  } else {
    grid.classList.add('multi');
  }

  images.forEach((item, index) => {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    const inner = document.createElement('div');
    inner.className = 'gallery-item-inner';

    const img = document.createElement('img');
    img.className = 'gallery-image';
    img.setAttribute('data-src', item.url);
    img.alt = item.caption || `Gallery image ${index + 1}`;
    img.loading = 'lazy';

    img.addEventListener('load', () => {
      img.classList.add('visible');
      galleryItem.classList.add('loaded');
    });

    inner.appendChild(img);
    galleryItem.appendChild(inner);

    if (item.caption) {
      const caption = document.createElement('div');
      caption.className = 'gallery-caption';
      caption.textContent = item.caption;
      galleryItem.appendChild(caption);
    }

    galleryItem.addEventListener('click', () => {
      openLightbox(index);
    });

    grid.appendChild(galleryItem);
  });

  wrapper.appendChild(grid);
  container.appendChild(wrapper);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src && !img.src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  const lazyImages = grid.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => observer.observe(img));

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  const lightboxContent = document.createElement('div');
  lightboxContent.className = 'lightbox-content';

  const lightboxImage = document.createElement('img');
  lightboxImage.className = 'lightbox-image';

  const lightboxCaption = document.createElement('div');
  lightboxCaption.className = 'lightbox-caption';

  lightboxContent.appendChild(lightboxImage);
  lightboxContent.appendChild(lightboxCaption);

  const closeButton = document.createElement('button');
  closeButton.className = 'lightbox-close';
  closeButton.innerHTML = '✕';
  closeButton.setAttribute('aria-label', 'Close lightbox');

  const prevButton = document.createElement('button');
  prevButton.className = 'lightbox-nav prev';
  prevButton.innerHTML = '‹';
  prevButton.setAttribute('aria-label', 'Previous image');

  const nextButton = document.createElement('button');
  nextButton.className = 'lightbox-nav next';
  nextButton.innerHTML = '›';
  nextButton.setAttribute('aria-label', 'Next image');

  lightbox.appendChild(lightboxContent);
  lightbox.appendChild(closeButton);

  if (images.length > 1) {
    lightbox.appendChild(prevButton);
    lightbox.appendChild(nextButton);
  }

  document.body.appendChild(lightbox);

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
  }

  function updateLightboxContent() {
    const item = images[currentLightboxIndex];
    lightboxImage.src = item.url;
    lightboxCaption.textContent = item.caption || '';
    lightboxCaption.style.display = item.caption ? 'block' : 'none';

    if (images.length > 1) {
      prevButton.disabled = currentLightboxIndex === 0;
      nextButton.disabled = currentLightboxIndex === images.length - 1;
    }
  }

  function showPrevious() {
    if (currentLightboxIndex > 0) {
      currentLightboxIndex--;
      updateLightboxContent();
    }
  }

  function showNext() {
    if (currentLightboxIndex < images.length - 1) {
      currentLightboxIndex++;
      updateLightboxContent();
    }
  }

  closeButton.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  prevButton.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrevious();
  });

  nextButton.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPrevious();
    } else if (e.key === 'ArrowRight') {
      showNext();
    }
  });
}