"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  video?: string;
  name: string;
}

/**
 * PDP gallery: large main image with a thumbnail strip below.
 * Hovering the main image plays a muted looping product video (real Glamnetic behavior).
 */
export function ProductGallery({ images, video, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play();
    }
  };
  const onLeave = () => videoRef.current?.pause();

  const showVideo = Boolean(video) && active === 0;

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-sm bg-white"
        onMouseEnter={showVideo ? onEnter : undefined}
        onMouseLeave={showVideo ? onLeave : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/${images[active]}`}
          alt={name}
          className="h-full w-full object-cover"
        />
        {showVideo && (
          <video
            ref={videoRef}
            src={`/videos/${video}`}
            poster={`/images/${images[0]}`}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative aspect-square w-[86px] shrink-0 overflow-hidden rounded-sm border transition",
                i === active ? "border-mauve" : "border-line hover:border-body",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/${img}`} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
