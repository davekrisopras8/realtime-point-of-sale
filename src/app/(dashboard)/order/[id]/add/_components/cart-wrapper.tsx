"use client";
import { useEffect, useRef, useState } from "react";

export default function CartWrapper({ children }: { children: React.ReactNode }) {
  const [translateY, setTranslateY] = useState(0);
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !contentRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const contentHeight = contentRef.current.offsetHeight;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top + scrollY;
      const containerBottom = containerTop + containerRect.height;

      const topPadding = 20;
      const bottomPadding = 20;
      const availableHeight = windowHeight - topPadding - bottomPadding;

      setMaxHeight(availableHeight);

      if (contentHeight <= availableHeight) {
        const newTranslate = Math.max(0, scrollY - containerTop + topPadding);
        const maxTranslate = containerRect.height - contentHeight - bottomPadding;
        setTranslateY(Math.min(newTranslate, Math.max(0, maxTranslate)));
        return;
      }

      const scrollStart = containerTop - topPadding;
      const scrollEnd = containerBottom - windowHeight + bottomPadding;

      if (scrollY < scrollStart) {
        setTranslateY(0);
      } else if (scrollY >= scrollStart && scrollY <= scrollEnd) {
        setTranslateY(scrollY - scrollStart);
      } else {
        setTranslateY(scrollEnd - scrollStart);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full min-h-screen">
      <div
        ref={contentRef}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.1s ease-out",
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          overflowY: maxHeight ? "auto" : "visible",
        }}
        className="w-full"
      >
        {children}
      </div>
    </div>
  );
}
