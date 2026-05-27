function initGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const config = window.CONFIG || {};
  const gallery = config.gallery || [];

  if (gallery.length === 0) {
    container.innerHTML = '';
    return;
  }

  const images = gallery.slice(0, 5);
  const gridClass =
    images.length === 1 ? 'gallery-single' :
    images.length === 2 ? 'gallery-double' :
    'gallery-multi';

  const imageElements = images.map((item, index) => {
    const isFirstInMulti = gridClass === 'gallery-multi' && index === 0;
    const itemClass = isFirstInMulti ? 'gallery-item gallery-item-featured' : 'gallery-item';

    return `
      <div class="${itemClass}" data-index="${index}">
        <div class="gallery-placeholder"></div>
        <img
          class="gallery-img"
          data-src="${item.url}"
          alt="${item.caption || ''}"
          loading="lazy"
        />
        ${item.caption ? `<p class="gallery-caption">${item.caption}</p>` : ''}
      </div>
    `;
  }).join('');

  const navControls = images.length > 1 ? `
    <button class="gallery-lightbox-nav gallery-lightbox-prev" aria-label="Previous image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
    <button class="gallery-lightbox-nav gallery-lightbox-next" aria-label="Next image">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  ` : '';

  container.innerHTML = `
    <div class="gallery-container ${gridClass}">
      ${imageElements}
    </div>
    <div class="gallery-lightbox" id="gallery-lightbox-${containerId}">
      <div class="gallery-lightbox-backdrop"></div>
      <button class="gallery-lightbox-close" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      ${navControls}
      <div class="gallery-lightbox-content">
        <img class="gallery-lightbox-img" src="" alt="" />
        <p class="gallery-lightbox-caption"></p>
      </div>
    </div>
  `;

  if (!document.getElementById('gallery-styles')) {
    const style = document.createElement('style');
    style.id = 'gallery-styles';
    style.textContent = `
      .gallery-container {
        width: 100%;
        display: grid;
        gap: 12px;
      }

      .gallery-single {
        grid-template-columns: 1fr;
      }

      .gallery-double {
        grid-template-columns: repeat(2, 1fr);
      }

      .gallery-multi {
        grid-template-columns: repeat(2, 1fr);
      }

      .gallery-item {
        position: relative;
        width: 100%;
        cursor: pointer;
        border-radius: 10px;
        overflow: hidden;
      }

      .gallery-item-featured {
        grid-column: 1 / -1;
      }

      .gallery-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-accent, #6366f1);
        opacity: 0.2;
        transition: opacity 0.3s ease;
      }

      .gallery-img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 10px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .gallery-img.loaded {
        opacity: 1;
      }

      .gallery-img.loaded ~ .gallery-placeholder {
        opacity: 0;
      }

      .gallery-caption {
        margin: 8px 0 0 0;
        font-size: 12px;
        color: var(--color-text-muted, #9ca3af);
        font-weight: 400;
        line-height: 1.4;
      }

      .gallery-item:hover .gallery-img {
        transform: scale(1.02);
        transition: transform 0.25s ease, opacity 0.3s ease;
      }

      .gallery-lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }

      .gallery-lightbox.active {
        opacity: 1;
        pointer-events: auto;
      }

      .gallery-lightbox-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        opacity: 0.95;
      }

      .gallery-lightbox-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .gallery-lightbox-img {
        max-width: 100%;
        max-height: calc(90vh - 60px);
        object-fit: contain;
        border-radius: 10px;
      }

      .gallery-lightbox-caption {
        margin: 0;
        font-size: 14px;
        color: #ffffff;
        font-weight: 400;
        text-align: center;
        max-width: 600px;
      }

      .gallery-lightbox-close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        border: none;
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, background-color 0.2s ease;
        z-index: 10001;
      }

      .gallery-lightbox-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: scale(1.08);
      }

      .gallery-lightbox-close:active {
        transform: scale(0.98);
      }

      .gallery-lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border: none;
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, background-color 0.2s ease;
        z-index: 10001;
      }

      .gallery-lightbox-nav:hover {
        background-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-50%) scale(1.08);
      }

      .gallery-lightbox-nav:active {
        transform: translateY(-50%) scale(0.98);
      }

      .gallery-lightbox-prev {
        left: 20px;
      }

      .gallery-lightbox-next {
        right: 20px;
      }

      body.gallery-lightbox-open {
        overflow: hidden;
      }

      @media (max-width: 768px) {
        .gallery-container {
          gap: 8px;
        }

        .gallery-caption {
          font-size: 11px;
          margin: 6px 0 0 0;
        }

        .gallery-lightbox-content {
          max-width: 95vw;
          max-height: 95vh;
          gap: 12px;
        }

        .gallery-lightbox-img {
          max-height: calc(95vh - 50px);
        }

        .gallery-lightbox-caption {
          font-size: 13px;
        }

        .gallery-lightbox-close {
          top: 12px;
          right: 12px;
        }

        .gallery-lightbox-nav {
          width: 40px;
          height: 40px;
        }

        .gallery-lightbox-prev {
          left: 12px;
        }

        .gallery-lightbox-next {
          right: 12px;
        }
      }

      @media (max-width: 380px) {
        .gallery-double {
          grid-template-columns: 1fr;
        }

        .gallery-multi {
          grid-template-columns: 1fr;
        }

        .gallery-container {
          gap: 8px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const lightbox = container.querySelector(`#gallery-lightbox-${containerId}`);
  const lightboxImg = lightbox.querySelector('.gallery-lightbox-img');
  const lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
  const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
  const backdrop = lightbox.querySelector('.gallery-lightbox-backdrop');
  const prevBtn = lightbox.querySelector('.gallery-lightbox-prev');
  const nextBtn = lightbox.querySelector('.gallery-lightbox-next');

  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = images[currentIndex];
    lightboxImg.src = item.url;
    lightboxImg.alt = item.caption || '';
    lightboxCaption.textContent = item.caption || '';
    lightbox.classList.add('active');
    document.body.classList.add('gallery-lightbox-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.classList.remove('gallery-lightbox-open');
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    openLightbox(currentIndex);
  }

  const galleryItems = container.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index, 10);
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrev();
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft' && images.length > 1) {
      showPrev();
    } else if (e.key === 'ArrowRight' && images.length > 1) {
      showNext();
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.onload = () => {
            img.classList.add('loaded');
          };
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px'
  });

  const lazyImages = container.querySelectorAll('.gallery-img[data-src]');
  lazyImages.forEach((img) => observer.observe(img));
}

if (typeof window !== 'undefined' && window.CONFIG) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.querySelector('[data-gallery]');
      if (container) {
        initGallery(container.id);
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGallery };
}
