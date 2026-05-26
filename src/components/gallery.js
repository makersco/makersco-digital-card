export function initGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container || !window.CONFIG?.gallery?.length) return;

  const gallery = window.CONFIG.gallery.slice(0, 5);

  const styles = `
    .gallery-grid {
      display: grid;
      gap: 16px;
      width: 100%;
    }

    .gallery-grid.layout-1 {
      grid-template-columns: 1fr;
    }

    .gallery-grid.layout-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .gallery-grid.layout-3plus {
      grid-template-columns: 1fr;
    }

    .gallery-grid.layout-3plus .gallery-item:first-child {
      grid-column: 1 / -1;
    }

    .gallery-grid.layout-3plus .gallery-items-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      grid-column: 1 / -1;
    }

    .gallery-item {
      position: relative;
      cursor: pointer;
    }

    .gallery-image-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 75%;
      border-radius: 10px;
      overflow: hidden;
      background: var(--color-accent, #6366f1);
      opacity: 0.2;
      transition: opacity 200ms;
    }

    .gallery-image-wrapper.loaded {
      opacity: 1;
      background: transparent;
    }

    .gallery-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 10px;
      opacity: 0;
      transition: opacity 200ms;
    }

    .gallery-image.visible {
      opacity: 1;
    }

    .gallery-caption {
      margin-top: 8px;
      font-size: 12px;
      color: var(--color-muted, #9ca3af);
      font-weight: 400;
    }

    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 250ms;
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
      transform: scale(0.95);
      transition: transform 250ms;
    }

    .lightbox.active .lightbox-content {
      transform: scale(1);
    }

    .lightbox-image {
      max-width: 100%;
      max-height: calc(90vh - 80px);
      border-radius: 10px;
      object-fit: contain;
    }

    .lightbox-caption {
      margin-top: 16px;
      font-size: 14px;
      color: #d1d5db;
      font-weight: 400;
      text-align: center;
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
      color: #fff;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 200ms, transform 200ms;
    }

    .lightbox-close:hover {
      opacity: 0.8;
      transform: scale(1.05);
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
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 200ms, transform 200ms;
    }

    .lightbox-nav:hover {
      opacity: 0.8;
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
      .lightbox-nav {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }

      .lightbox-nav.prev {
        left: 12px;
      }

      .lightbox-nav.next {
        right: 12px;
      }

      .lightbox-close {
        top: 12px;
        right: 12px;
        width: 40px;
        height: 40px;
        font-size: 20px;
      }
    }
  `;

  if (!document.getElementById('gallery-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'gallery-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  const layoutClass = gallery.length === 1 ? 'layout-1' :
                     gallery.length === 2 ? 'layout-2' : 'layout-3plus';

  let gridHTML = `<div class="gallery-grid ${layoutClass}">`;

  if (gallery.length >= 3) {
    gridHTML += `
      <div class="gallery-item" data-index="0">
        <div class="gallery-image-wrapper">
          <img class="gallery-image" data-src="${gallery[0].url}" alt="${gallery[0].caption || ''}" loading="lazy">
        </div>
        ${gallery[0].caption ? `<div class="gallery-caption">${gallery[0].caption}</div>` : ''}
      </div>
      <div class="gallery-items-row">
    `;

    for (let i = 1; i < gallery.length; i++) {
      gridHTML += `
        <div class="gallery-item" data-index="${i}">
          <div class="gallery-image-wrapper">
            <img class="gallery-image" data-src="${gallery[i].url}" alt="${gallery[i].caption || ''}" loading="lazy">
          </div>
          ${gallery[i].caption ? `<div class="gallery-caption">${gallery[i].caption}</div>` : ''}
        </div>
      `;
    }

    gridHTML += `</div>`;
  } else {
    for (let i = 0; i < gallery.length; i++) {
      gridHTML += `
        <div class="gallery-item" data-index="${i}">
          <div class="gallery-image-wrapper">
            <img class="gallery-image" data-src="${gallery[i].url}" alt="${gallery[i].caption || ''}" loading="lazy">
          </div>
          ${gallery[i].caption ? `<div class="gallery-caption">${gallery[i].caption}</div>` : ''}
        </div>
      `;
    }
  }

  gridHTML += `</div>`;

  const lightboxHTML = `
    <div class="lightbox" id="gallery-lightbox">
      <button class="lightbox-close" aria-label="Close">×</button>
      ${gallery.length > 1 ? `
        <button class="lightbox-nav prev" aria-label="Previous">‹</button>
        <button class="lightbox-nav next" aria-label="Next">›</button>
      ` : ''}
      <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    </div>
  `;

  container.innerHTML = gridHTML + lightboxHTML;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const wrapper = img.parentElement;
        img.src = img.dataset.src;
        img.onload = () => {
          img.classList.add('visible');
          wrapper.classList.add('loaded');
        };
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  container.querySelectorAll('.gallery-image').forEach(img => {
    observer.observe(img);
  });

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
  const nextBtn = lightbox.querySelector('.lightbox-nav.next');

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-open');
  }

  function updateLightbox() {
    const item = gallery[currentIndex];
    lightboxImg.src = item.url;
    lightboxCaption.textContent = item.caption || '';

    if (prevBtn && nextBtn) {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex === gallery.length - 1;
    }
  }

  function navigate(direction) {
    currentIndex = Math.max(0, Math.min(gallery.length - 1, currentIndex + direction));
    updateLightbox();
  }

  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      navigate(-1);
    } else if (e.key === 'ArrowRight' && currentIndex < gallery.length - 1) {
      navigate(1);
    }
  });
}
