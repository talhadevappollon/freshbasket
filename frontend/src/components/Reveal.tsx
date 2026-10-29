'use client';

import React, { useEffect, useRef } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** ms before the transition starts – use to stagger siblings */
  delay?: number;
  variant?: 'up' | 'left' | 'right' | 'zoom';
  as?: 'div' | 'section' | 'li';
}

/**
 * Fades/slides content in the first time it scrolls into view.
 * Styles live in globals.css (.js-reveal .reveal); without JS or with
 * prefers-reduced-motion the content is simply visible.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  variant = 'up',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={variant === 'up' ? undefined : variant}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
