"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { ANNOUNCEMENTS as MESSAGES } from "@/lib/data/content";

function useCountdown() {
  const [label, setLabel] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0); // end of today
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3.6e6);
      const m = Math.floor((diff % 3.6e6) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      setLabel(`${h}H ${m}M ${s}S`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return label;
}

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const countdown = useCountdown();
  const move = (d: number) => setI((v) => (v + d + MESSAGES.length) % MESSAGES.length);

  return (
    <div className="bg-mauve-2 text-white">
      <div className="mx-auto flex h-[42px] max-w-[1500px] items-center justify-between px-4">
        <button type="button" aria-label="Previous offer" onClick={() => move(-1)} className="p-1">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <p className="flex items-center gap-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] sm:text-xs">
          {MESSAGES[i]}
          {i === 0 && <span className="tabular-nums opacity-90">{countdown}</span>}
        </p>
        <button type="button" aria-label="Next offer" onClick={() => move(1)} className="p-1">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
