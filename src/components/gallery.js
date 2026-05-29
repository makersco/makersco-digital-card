export function initGallery(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const gallery = window.CONFIG?.gallery || [];
  if (!gallery.length || gallery.length === 0) {
    container.style.display = 'none';
    return;
  }

  const validGallery = gallery.slice(0, 5).filter(item => item.url);
  if (validGallery.length === 0) {
    container.style.display = 'none';
    return;
  }

  const styles = `
    .gallery-container {
      width: 100%;
      padding: 0;
      margin: 0;
    }

    .gallery-grid {
      display: grid;
      gap: 12px;
      width: 100%;
    }

    .gallery-grid.grid-1 {
      grid-template-columns: 1fr;
    }

    .gallery-grid.grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    .gallery-grid.grid-3plus .gallery-item:first-child {
      grid-column: 1 / -1;
    }

    .gallery-grid.grid-3plus {
      grid-template-columns: 1fr 1fr;
    }

    .gallery-item {
      position: relative;
      cursor: pointer;
      overflow: hidden;
      border-radius: 10px;
      background: var(--color-accent, #6366f1);
      opacity: 0.2;
      aspect-ratio: 16 / 10;
      transition: opacity 200ms ease, transform 200ms ease;
    }

    .gallery-item:hover {
      opacity: 1;
      transform: scale(1.02);
    }

    .gallery-item.loaded {
      opacity: 1;
      background: transparent;
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 10px;
    }

    .gallery-caption {
      margin-top: 8px;
      font-size: 12px;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
      text-align: left;
    }

    .gallery-lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 15, 0.95);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 250ms ease;
    }

    .gallery-lightbox.active {
      display: flex;
      opacity: 1;
    }

    .gallery-lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .gallery-lightbox-image {
      max-width: 100%;
      max-height: 80vh;
      border-radius: 10px;
      object-fit: contain;
      transform: scale(0.95);
      opacity: 0;
      transition: transform 250ms ease, opacity 250ms ease;
    }

    .gallery-lightbox.active .gallery-lightbox-image {
      transform: scale(1);
      opacity: 1;
    }

    .gallery-lightbox-caption {
      font-size: 14px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      text-align: center;
      max-width: 600px;
      padding: 0 16px;
    }

    .gallery-lightbox-close {
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
      font-weight: 300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 200ms ease, transform 200ms ease;
      z-index: 10001;
    }

    .gallery-lightbox-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .gallery-lightbox-nav {
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
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 200ms ease, transform 200ms ease;
      z-index: 10001;
    }

    .gallery-lightbox-nav:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1.1);
    }

    .gallery-lightbox-nav.prev {
      left: 20px;
    }

    .gallery-lightbox-nav.next {
      right: 20px;
    }

    .gallery-lightbox-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .gallery-lightbox-nav:disabled:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-50%) scale(1);
    }

    @media (max-width: 768px) {
      .gallery-grid {
        gap: 8px;
      }

      .gallery-lightbox-close {
        top: 12px;
        right: 12px;
      }

      .gallery-lightbox-nav.prev {
        left: 12px;
      }

      .gallery-lightbox-nav.next {
        right: 12px;
      }

      .gallery-lightbox-content {
        max-width: 95vw;
        max-height: 95vh;
      }

      .gallery-lightbox-image {
        max-height: 75vh;
      }
    }

    @media (max-width: 380px) {
      .gallery-grid.grid-2,
      .gallery-grid.grid-3plus {
        grid-template-columns: 1fr;
      }

      .gallery-grid.grid-3plus .gallery-item:first-child {
        grid-column: 1;
      }
    }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  let gridClass = 'grid-1';
  if (validGallery.length === 2) {
    gridClass = 'grid-2';
  } else if (validGallery.length >= 3) {
    gridClass = 'grid-3plus';
  }

  const galleryHTML = `
    <div class="gallery-container">
      <div class="gallery-grid ${gridClass}">
        ${validGallery.map((item, index) => `
          <div class="gallery-item" data-index="${index}">
            <img data-src="${item.url}" alt="${item.caption || ''}" />
            ${item.caption ? `<div class="gallery-caption">${item.caption}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = galleryHTML;

  const lightboxHTML = `
    <div class="gallery-lightbox" id="gallery-lightbox">
      <button class="gallery-lightbox-close" aria-label="Close">&times;</button>
      ${validGallery.length > 1 ? `
        <button class="gallery-lightbox-nav prev" aria-label="Previous">‹</button>
        <button class="gallery-lightbox-nav next" aria-label="Next">›</button>
      ` : ''}
      <div class="gallery-lightbox-content">
        <img class="gallery-lightbox-image" src="" alt="" />
        <div class="gallery-lightbox-caption"></div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const galleryItems = container.querySelectorAll('.gallery-item');
  const images = container.querySelectorAll('.gallery-item img');

  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.onload = () => {
            img.parentElement.classList.add('loaded');
          };
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, observerOptions);

  images.forEach(img => imageObserver.observe(img));

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImage = lightbox.querySelector('.gallery-lightbox-image');
  const lightboxCaption = lightbox.querySelector('.gallery-lightbox-caption');
  const closeBtn = lightbox.querySelector('.gallery-lightbox-close');
  const prevBtn = lightbox.querySelector('.gallery-lightbox-nav.prev');
  const nextBtn = lightbox.querySelector('.gallery-lightbox-nav.next');

  let currentIndex = 0;
  let originalOverflow = '';

  function openLightbox(index) {
    currentIndex = index;
    const item = validGallery[index];
    
    lightboxImage.src = item.url;
    lightboxImage.alt = item.caption || '';
    lightboxCaption.textContent = item.caption || '';
    
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    lightbox.classList.add('active');
    
    if (prevBtn && nextBtn) {
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === validGallery.length - 1;
    }
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = originalOverflow;
    setTimeout(() => {
      lightboxImage.src = '';
      lightboxCaption.textContent = '';
    }, 250);
  }

  function showPrevious() {
    if (currentIndex > 0) {
      openLightbox(currentIndex - 1);
    }
  }

  function showNext() {
    if (currentIndex < validGallery.length - 1) {
      openLightbox(currentIndex + 1);
    }
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', showPrevious);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', showNext);
  }

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

  return {
    destroy: () => {
      imageObserver.disconnect();
      lightbox.remove();
      styleSheet.remove();
    }
  };
}