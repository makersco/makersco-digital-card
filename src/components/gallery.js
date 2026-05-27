export function initGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!window.CONFIG?.gallery || window.CONFIG.gallery.length === 0) {
    container.style.display = 'none';
    return;
  }

  const images = window.CONFIG.gallery.slice(0, 5);
  let currentLightboxIndex = 0;
  let lightboxOpen = false;

  const galleryHTML = `
    <div class="gallery-grid gallery-count-${images.length}">
      ${images.map((img, idx) => `
        <div class="gallery-item" data-index="${idx}">
          <div class="gallery-placeholder"></div>
          <img 
            class="gallery-image" 
            data-src="${img.url}" 
            alt="${img.caption || ''}"
            loading="lazy"
          />
          ${img.caption ? `<div class="gallery-caption">${img.caption}</div>` : ''}
        </div>
      `).join('')}
    </div>
    <div class="gallery-lightbox" id="gallery-lightbox">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      ${images.length > 1 ? `
        <button class="lightbox-prev" aria-label="Previous">&lsaquo;</button>
        <button class="lightbox-next" aria-label="Next">&rsaquo;</button>
      ` : ''}
      <div class="lightbox-content">
        <img class="lightbox-image" src="" alt="" />
        <div class="lightbox-caption"></div>
      </div>
    </div>
  `;

  container.innerHTML = galleryHTML;

  const style = document.createElement('style');
  style.textContent = `
    .gallery-grid {
      display: grid;
      gap: 16px;
      margin: 0;
      padding: 0;
    }

    .gallery-count-1 {
      grid-template-columns: 1fr;
    }

    .gallery-count-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .gallery-count-3,
    .gallery-count-4,
    .gallery-count-5 {
      grid-template-columns: repeat(2, 1fr);
    }

    .gallery-count-3 .gallery-item:first-child,
    .gallery-count-4 .gallery-item:first-child,
    .gallery-count-5 .gallery-item:first-child {
      grid-column: 1 / -1;
    }

    .gallery-item {
      position: relative;
      cursor: pointer;
      overflow: hidden;
    }

    .gallery-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-accent, #6366f1);
      opacity: 0.2;
      border-radius: 10px;
      transition: opacity 200ms;
    }

    .gallery-image {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 10px;
      opacity: 0;
      transition: opacity 300ms;
      position: relative;
      z-index: 1;
    }

    .gallery-image.loaded {
      opacity: 1;
    }

    .gallery-image.loaded ~ .gallery-placeholder {
      opacity: 0;
    }

    .gallery-caption {
      margin-top: 8px;
      font-size: 12px;
      color: var(--color-text-muted, #9ca3af);
      line-height: 1.4;
    }

    .gallery-lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 300ms;
    }

    .gallery-lightbox.active {
      display: flex;
      opacity: 1;
    }

    .lightbox-content {
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
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
      color: #e5e7eb;
      text-align: center;
      max-width: 600px;
    }

    .lightbox-close,
    .lightbox-prev,
    .lightbox-next {
      position: absolute;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 40px;
      cursor: pointer;
      padding: 12px;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3;
      opacity: 0.8;
      transition: opacity 200ms, transform 200ms;
      font-weight: 300;
      line-height: 1;
    }

    .lightbox-close:hover,
    .lightbox-prev:hover,
    .lightbox-next:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .lightbox-close {
      top: 20px;
      right: 20px;
      font-size: 48px;
    }

    .lightbox-prev {
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 60px;
    }

    .lightbox-prev:hover {
      transform: translateY(-50%) scale(1.1);
    }

    .lightbox-next {
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 60px;
    }

    .lightbox-next:hover {
      transform: translateY(-50%) scale(1.1);
    }

    @media (max-width: 768px) {
      .lightbox-prev,
      .lightbox-next {
        font-size: 44px;
      }

      .lightbox-close {
        font-size: 36px;
      }

      .lightbox-content {
        max-width: 95vw;
      }
    }

    body.lightbox-active {
      overflow: hidden;
    }
  `;

  if (!document.querySelector('#gallery-styles')) {
    style.id = 'gallery-styles';
    document.head.appendChild(style);
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src && !img.src) {
          img.src = src;
          img.onload = () => {
            img.classList.add('loaded');
          };
          imageObserver.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  const galleryImages = container.querySelectorAll('.gallery-image');
  galleryImages.forEach(img => imageObserver.observe(img));

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImage = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  function openLightbox(index) {
    currentLightboxIndex = index;
    lightboxOpen = true;
    const img = images[index];
    lightboxImage.src = img.url;
    lightboxImage.alt = img.caption || '';
    lightboxCaption.textContent = img.caption || '';
    lightbox.classList.add('active');
    document.body.classList.add('lightbox-active');
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightbox.classList.remove('active');
    document.body.classList.remove('lightbox-active');
  }

  function showPrevious() {
    currentLightboxIndex = (currentLightboxIndex - 1 + images.length) % images.length;
    openLightbox(currentLightboxIndex);
  }

  function showNext() {
    currentLightboxIndex = (currentLightboxIndex + 1) % images.length;
    openLightbox(currentLightboxIndex);
  }

  const galleryItems = container.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(index);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrevious();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && images.length > 1) {
      showPrevious();
    } else if (e.key === 'ArrowRight' && images.length > 1) {
      showNext();
    }
  });

  return {
    destroy: () => {
      galleryImages.forEach(img => imageObserver.unobserve(img));
      imageObserver.disconnect();
      container.innerHTML = '';
      document.body.classList.remove('lightbox-active');
    }
  };
}