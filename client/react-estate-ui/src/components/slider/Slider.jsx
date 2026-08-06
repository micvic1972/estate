import { useState, useEffect, useCallback, useRef } from "react";
import "./slider.scss";

function Slider({ images = [] }) {
  const [imageIndex, setImageIndex] = useState(null);
  const touchStartX = useRef(null);

  // Guard: nothing to show, don't render anything (prevents "images[0] undefined" crashes)
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  const isLightboxOpen = imageIndex !== null;

  // useCallback so this function reference is stable and always defined
  // before it's used anywhere below — avoids "function not defined" errors
  const changeSlide = useCallback(
    (direction) => {
      setImageIndex((current) => {
        if (current === null) return current;
        const lastIndex = images.length - 1;

        if (direction === "left") {
          return current === 0 ? lastIndex : current - 1;
        }
        // direction === "right"
        return current === lastIndex ? 0 : current + 1;
      });
    },
    [images.length]
  );

  const openLightbox = (index) => setImageIndex(index);
  const closeLightbox = () => setImageIndex(null);

  // Keyboard support: Left/Right arrows, Escape to close
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") changeSlide("left");
      if (e.key === "ArrowRight") changeSlide("right");
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, changeSlide]);

  // Swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 50;

    if (deltaX > SWIPE_THRESHOLD) changeSlide("left");
    else if (deltaX < -SWIPE_THRESHOLD) changeSlide("right");

    touchStartX.current = null;
  };

  return (
    <div className="slider">
      {isLightboxOpen && (
        <div
          className="fullSlider"
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 1 && (
            <div
              className="arrow"
              onClick={(e) => {
                e.stopPropagation();
                changeSlide("left");
              }}
            >
              <img src="/arrow.png" alt="previous" />
            </div>
          )}

          <div className="imgContainer" onClick={(e) => e.stopPropagation()}>
            <img src={images[imageIndex]} alt="" />
          </div>

          {images.length > 1 && (
            <div
              className="arrow"
              onClick={(e) => {
                e.stopPropagation();
                changeSlide("right");
              }}
            >
              <img src="/arrow.png" className="right" alt="next" />
            </div>
          )}

          <div
            className="close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            X
          </div>
        </div>
      )}

      <div className="bigImage">
        <img src={images[0]} alt="" onClick={() => openLightbox(0)} />
      </div>

      {images.length > 1 && (
        <div className="smallImages">
          {images.slice(1).map((image, index) => (
            <img
              src={image}
              alt=""
              key={index}
              onClick={() => openLightbox(index + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Slider;
