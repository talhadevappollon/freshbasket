'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X, ZoomIn } from 'lucide-react';
import { PLACEHOLDER_IMG } from '@/lib/placeholder';

interface Props {
  images: string[];
  activeImage: string;
  onSelect: (url: string) => void;
  alt: string;
  badge?: React.ReactNode;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const HOVER_SCALE = 2.2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Main product image with two ways to look closer:
 *  - desktop: hovering magnifies the image under the cursor
 *  - everywhere: click / tap (or the Zoom button) opens a full-screen viewer with pinch, double-tap,
 *    mouse-wheel, drag-to-pan, +/- buttons and keyboard shortcuts.
 */
export default function ProductImageViewer({ images, activeImage, onSelect, alt, badge }: Props) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const src = activeImage || images[0] || PLACEHOLDER_IMG;

  return (
    <>
      <div className="relative bg-slate-50 rounded-3xl border border-gray-100 flex items-center justify-center h-52 sm:h-96 overflow-hidden group">
        {badge}

        <button
          type="button"
          onClick={() => setOpen(true)}
          onPointerMove={e => {
            if (e.pointerType !== 'mouse') return;
            const r = e.currentTarget.getBoundingClientRect();
            setHover({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onPointerLeave={() => setHover(null)}
          aria-label={`Zoom in on ${alt}`}
          className="absolute inset-0 w-full h-full flex items-center justify-center p-5 sm:p-8 cursor-zoom-in focus-visible:outline-offset-[-4px]"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-44 sm:max-h-72 max-w-full object-contain transition-transform duration-200 ease-out will-change-transform"
            style={hover ? { transform: `scale(${HOVER_SCALE})`, transformOrigin: `${hover.x}% ${hover.y}%` } : undefined}
            draggable={false}
            onError={e => {
              (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open zoom viewer"
          className="absolute bottom-3 right-3 z-10 h-11 pl-3 pr-4 rounded-full bg-white/95 hover:bg-fresh-600 hover:text-white hover:border-fresh-600 text-slate-800 border border-slate-200 shadow-md backdrop-blur flex items-center gap-1.5 text-sm font-bold transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4.5 h-4.5" aria-hidden="true" />
          Zoom
        </button>
      </div>

      {open && <Lightbox images={images.length ? images : [src]} startUrl={src} alt={alt} onSelect={onSelect} onClose={() => setOpen(false)} />}
    </>
  );
}

interface LightboxProps {
  images: string[];
  startUrl: string;
  alt: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

function Lightbox({ images, startUrl, alt, onSelect, onClose }: LightboxProps) {
  const [index, setIndex] = useState(Math.max(0, images.indexOf(startUrl)));
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [gesturing, setGesturing] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; scale: number } | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const dragged = useRef(false);

  const url = images[index] ?? startUrl;

  // Keep panning inside the picture: at scale s the image may travel (s-1)/2 of the stage each way
  const bound = useCallback((scale: number, x: number, y: number) => {
    const el = stageRef.current;
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    const mx = ((scale - 1) * w) / 2;
    const my = ((scale - 1) * h) / 2;
    return { scale, x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  }, []);

  const reset = useCallback(() => setView({ scale: 1, x: 0, y: 0 }), []);

  const zoomTo = useCallback(
    (nextScale: number, focus?: { x: number; y: number }) => {
      const { scale, x, y } = viewRef.current;
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      if (s === MIN_SCALE) return setView({ scale: 1, x: 0, y: 0 });
      const k = s / scale;
      // zoom about the focus point (relative to the stage centre) so what you tapped stays under your finger
      const fx = focus?.x ?? 0;
      const fy = focus?.y ?? 0;
      setView(bound(s, fx - (fx - x) * k, fy - (fy - y) * k));
    },
    [bound]
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      if (images.length < 2) return;
      const next = (index + dir + images.length) % images.length;
      setIndex(next);
      onSelect(images[next]);
      reset();
    },
    [images, index, onSelect, reset]
  );

  // Lock page scroll, take focus, restore both on close
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') zoomTo(viewRef.current.scale + 0.5);
      else if (e.key === '-' || e.key === '_') zoomTo(viewRef.current.scale - 0.5);
      else if (e.key === '0') reset();
      else if (e.key === 'ArrowRight') viewRef.current.scale > 1 ? setView(v => bound(v.scale, v.x - 60, v.y)) : go(1);
      else if (e.key === 'ArrowLeft') viewRef.current.scale > 1 ? setView(v => bound(v.scale, v.x + 60, v.y)) : go(-1);
      else if (e.key === 'ArrowUp' && viewRef.current.scale > 1) setView(v => bound(v.scale, v.x, v.y + 60));
      else if (e.key === 'ArrowDown' && viewRef.current.scale > 1) setView(v => bound(v.scale, v.x, v.y - 60));
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, zoomTo, reset, go, bound]);

  // Mouse wheel / trackpad pinch zoom. Needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const focus = { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2) };
      zoomTo(viewRef.current.scale * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)), focus);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomTo]);

  const centreRelative = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // not a live pointer (synthetic event); gestures still work without capture
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged.current = false;
    setGesturing(true);
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: viewRef.current.scale };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const focus = centreRelative((a.x + b.x) / 2, (a.y + b.y) / 2);
      const s = clamp(pinch.current.scale * (dist / pinch.current.dist), MIN_SCALE, MAX_SCALE);
      const { scale, x, y } = viewRef.current;
      const k = s / scale;
      setView(bound(s, focus.x - (focus.x - x) * k, focus.y - (focus.y - y) * k));
      dragged.current = true;
    } else if (pointers.current.size === 1 && viewRef.current.scale > 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 0) dragged.current = true;
      setView(v => bound(v.scale, v.x + dx, v.y + dy));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasOnly = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setGesturing(false);

    // Double tap / double click toggles between fit and zoomed-in at that spot
    if (wasOnly && !dragged.current) {
      const now = performance.now();
      const last = lastTap.current;
      if (now - last.t < 320 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 30) {
        if (viewRef.current.scale > 1.05) reset();
        else zoomTo(DOUBLE_TAP_SCALE, centreRelative(e.clientX, e.clientY));
        lastTap.current = { t: 0, x: 0, y: 0 };
      } else {
        lastTap.current = { t: now, x: e.clientX, y: e.clientY };
      }
    }
  };

  const pct = Math.round(view.scale * 100);
  const ctl =
    'w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 disabled:opacity-35 disabled:hover:bg-white/10 text-white border border-white/20 backdrop-blur flex items-center justify-center transition-colors cursor-pointer';

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in" role="dialog" aria-modal="true" aria-label={`${alt}, zoom viewer`}>
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-3 sm:px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 text-white">
        <p className="min-w-0 truncate text-sm font-semibold">{alt}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xs:inline text-xs tabular-nums text-white/70 w-12 text-right" aria-live="polite">
            {pct}%
          </span>
          <button type="button" onClick={() => zoomTo(view.scale - 0.75)} disabled={view.scale <= MIN_SCALE} aria-label="Zoom out" className={ctl}>
            <Minus className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => zoomTo(view.scale + 0.75)} disabled={view.scale >= MAX_SCALE} aria-label="Zoom in" className={ctl}>
            <Plus className="w-5 h-5" />
          </button>
          <button type="button" onClick={reset} disabled={view.scale === 1} aria-label="Reset zoom" className={`${ctl} hidden sm:flex`}>
            <RotateCcw className="w-4.5 h-4.5" />
          </button>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close zoom viewer" className={ctl}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={e => {
          // a click on the empty backdrop (not the picture) closes the viewer
          if (e.target === e.currentTarget && view.scale === 1) onClose();
        }}
        className={`relative flex-1 min-h-0 overflow-hidden flex items-center justify-center select-none ${view.scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
        style={{ touchAction: 'none' }}
      >
        <img
          src={url}
          alt={alt}
          draggable={false}
          className="max-w-[94%] max-h-[94%] object-contain bg-white rounded-2xl p-3"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transition: gesturing ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          onError={e => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />

        {images.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${ctl} absolute left-2 sm:left-4 top-1/2 -translate-y-1/2`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${ctl} absolute right-2 sm:right-4 top-1/2 -translate-y-1/2`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Footer: thumbnails + hint */}
      <div className="px-3 sm:px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-2 overflow-x-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => {
                  setIndex(i);
                  onSelect(img);
                  reset();
                }}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === index ? 'true' : undefined}
                className={`w-12 h-12 rounded-xl bg-white p-1 shrink-0 border-2 transition-all cursor-pointer ${i === index ? 'border-fresh-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" draggable={false} />
              </button>
            ))}
          </div>
        )}
        <p className="text-xs text-white/60">
          <span className="sm:hidden">Pinch or double-tap to zoom · drag to move</span>
          <span className="hidden sm:inline">Scroll or double-click to zoom · drag to move · + / − / 0 on the keyboard · Esc to close</span>
        </p>
      </div>
    </div>
  );
}
