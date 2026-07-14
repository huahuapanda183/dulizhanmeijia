"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/api";

/** Records a product detail "view" once when the PDP mounts. Renders nothing. */
export function TrackProductView({ handle, title }: { handle: string; title: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    void trackEvent({ type: "view", handle, title });
  }, [handle, title]);
  return null;
}
