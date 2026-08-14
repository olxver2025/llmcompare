"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontally scrollable region with a second scrollbar at the top of the
 * region, pinned under the site header while the region is in view. Wide
 * tables can then be scrolled sideways from the first row instead of only
 * from the native scrollbar under the last row.
 *
 * The rail is only rendered when the content actually overflows, and it stays
 * in sync with the content scroller in both directions.
 */
export function ScrollX({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const railRef = React.useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(0);
  const [overflows, setOverflows] = React.useState(false);

  React.useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // ResizeObserver fires an initial observation, so measurement happens in
    // the callback rather than synchronously in the effect body.
    const observer = new ResizeObserver(() => {
      setContentWidth(scroller.scrollWidth);
      setOverflows(scroller.scrollWidth > scroller.clientWidth + 1);
    });
    observer.observe(scroller);
    // The content box changes width on filter/sort without the scroller
    // resizing, so watch it too.
    const content = scroller.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const sync = (
    from: HTMLDivElement | null,
    to: HTMLDivElement | null
  ) => {
    if (!from || !to || to.scrollLeft === from.scrollLeft) return;
    to.scrollLeft = from.scrollLeft;
  };

  return (
    <div data-slot="scroll-x" className={cn("relative", className)} {...props}>
      <div
        ref={railRef}
        aria-hidden
        className={cn(
          "scroll-rail sticky top-12 z-20 h-2.5 overflow-x-auto overflow-y-hidden bg-background",
          !overflows && "hidden"
        )}
        onScroll={() => sync(railRef.current, scrollerRef.current)}
      >
        <div style={{ width: contentWidth, height: 1 }} />
      </div>
      <div
        ref={scrollerRef}
        data-slot="scroll-x-viewport"
        className="scroll-rail w-full overflow-x-auto"
        onScroll={() => sync(scrollerRef.current, railRef.current)}
      >
        {children}
      </div>
    </div>
  );
}
