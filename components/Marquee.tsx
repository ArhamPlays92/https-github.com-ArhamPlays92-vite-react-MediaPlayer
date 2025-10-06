import React, { useState, useRef, useEffect, ElementType } from 'react';

interface MarqueeProps {
  text: string;
  as?: ElementType;
  className?: string;
  autoPlay?: boolean;
}

const Marquee: React.FC<MarqueeProps> = ({ text, as: Component = 'div', className = '', autoPlay = false }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;

    const checkOverflow = () => {
      if (!container || !textEl) return;
      // Adding a 1px tolerance to prevent flicker for titles that are exactly the container width
      const hasOverflow = textEl.offsetWidth > container.offsetWidth + 1;
      
      // Only update state if it changes to avoid re-render loops
      setIsOverflowing(current => current === hasOverflow ? current : hasOverflow);
    };

    // Run check on mount and whenever the text changes
    checkOverflow();

    // Also re-run check if container resizes
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  const containerClasses = `relative w-full overflow-hidden whitespace-nowrap ${className} ${isOverflowing ? 'animate-marquee-container' : ''} ${isOverflowing && autoPlay ? 'autoplay' : ''}`;

  return (
    // @ts-ignore
    <Component ref={containerRef} className={containerClasses} tabIndex={isOverflowing ? 0 : -1}>
      {/* 
        This invisible span is used for measurement. It's positioned absolutely so it doesn't affect
        the container's dimensions, allowing for an accurate width comparison.
      */}
      <span ref={textRef} className="absolute invisible whitespace-nowrap -z-10" aria-hidden="true">{text}</span>
      
      {isOverflowing ? (
        <div className="flex items-center animate-marquee-content will-change-transform">
          <span className="whitespace-nowrap pr-12">{text}</span>
          <span className="whitespace-nowrap pr-12" aria-hidden="true">{text}</span>
        </div>
      ) : (
        <span className="truncate">{text}</span>
      )}
    </Component>
  );
};

export default Marquee;