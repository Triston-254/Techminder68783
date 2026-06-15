import { useLanguage } from '../context/LanguageContext';

function PromoSlider() {
  const { page } = useLanguage();
  const slides = page.sliderMessages;

  return (
    <div className="promo-carousel">
      <div className="promo-carousel-row">
        <button
          className="promo-arrow-btn"
          type="button"
          data-bs-target="#promoCarousel"
          data-bs-slide="prev"
          aria-label="Previous slide"
        >
          ‹
        </button>

        <div
          id="promoCarousel"
          className="carousel slide promo-carousel-body"
          data-bs-ride="carousel"
          data-bs-interval="4500"
          data-bs-pause="hover"
        >
          <div className="carousel-inner">
            {slides.map((message, index) => (
              <div
                key={message}
                className={`carousel-item${index === 0 ? ' active' : ''}`}
              >
                <p className="promo-slide-text mb-0">{message}</p>
              </div>
            ))}
          </div>

          <div className="carousel-indicators promo-carousel-dots">
            {slides.map((message, index) => (
              <button
                key={`${message}-dot`}
                type="button"
                data-bs-target="#promoCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? 'active' : ''}
                aria-current={index === 0 ? 'true' : undefined}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          className="promo-arrow-btn"
          type="button"
          data-bs-target="#promoCarousel"
          data-bs-slide="next"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default PromoSlider;
