import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
  memo
} from 'react';
import './VirtualScroll.css';

const VirtualScroll = memo(({
  items = [],
  itemHeight,                 // fixed height (number) if provided
  containerHeight,            // optional fixed container height
  overscan = 3,               // extra rows above/below viewport
  renderItem,                 // (item, index, isScrolling) => ReactNode
  onScroll,
  className = '',
  loadMore,                   // () => void
  hasMore = false,
  loading = false,
  estimatedItemHeight = 300,  // used when dynamic heights unknown
  getItemHeight,              // optional (index) => number
  gap = 16,
  columns = 1
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const [heightsMap, setHeightsMap] = useState({}); // dynamic heights snapshot for render-safe usage

  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const itemHeightsRef = useRef({}); // internal backing store for dynamic heights (no re-render)
  const itemsResizeObserverRef = useRef(null);
  const containerResizeObserverRef = useRef(null);

  // Helper to schedule state changes asynchronously to avoid "sync setState in effect" lint warnings
  const schedule = (cb) => {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(cb);
    } else {
      Promise.resolve().then(cb);
    }
  };

  // Measure container height unless a fixed containerHeight prop is provided
  useLayoutEffect(() => {
    if (containerHeight) return; // rely on provided height

    const el = scrollContainerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.clientHeight || 0;
      schedule(() => setMeasuredHeight(h));
    };

    updateHeight();

    // Observe container size changes
    const ro = new ResizeObserver(() => updateHeight());
    containerResizeObserverRef.current = ro;
    ro.observe(el);

    return () => {
      if (containerResizeObserverRef.current) {
        containerResizeObserverRef.current.disconnect();
        containerResizeObserverRef.current = null;
      }
    };
  }, [containerHeight]);

  // Compute the viewport height used for calculations (render-safe state/props only)
  const viewportHeight = containerHeight || measuredHeight || 0;

  // getActualItemHeight - render-safe (uses state and props only)
  const getActualItemHeight = useCallback(
    (index) => {
      if (typeof itemHeight === 'number') return itemHeight;
      if (typeof getItemHeight === 'function') return getItemHeight(index);
      return heightsMap[index] || estimatedItemHeight;
    },
    [itemHeight, getItemHeight, heightsMap, estimatedItemHeight]
  );

  // Calculate visible range without accessing refs during render
  const visibleRange = useMemo(() => {
    if (!items.length) {
      return { startIndex: 0, endIndex: -1, offsetY: 0 };
    }

    const st = scrollTop;
    const vh = viewportHeight;

    // Fixed-height fast path
    if (typeof itemHeight === 'number') {
      const rowHeight = itemHeight + gap;
      const startRow = Math.floor(st / rowHeight);
      const endRow = Math.ceil((st + vh) / rowHeight);

      const startIndex = Math.max(0, (startRow - overscan) * columns);
      const endIndex = Math.min(items.length - 1, (endRow + overscan) * columns - 1);
      const offsetY = Math.max(0, (startRow - overscan) * rowHeight);

      return { startIndex, endIndex, offsetY };
    }

    // Dynamic-height path
    const rows = Math.ceil(items.length / columns);

    // Precompute row heights
    const rowHeights = new Array(rows);
    for (let r = 0; r < rows; r++) {
      let maxH = 0;
      for (let c = 0; c < columns; c++) {
        const idx = r * columns + c;
        if (idx < items.length) {
          const h = getActualItemHeight(idx);
          maxH = Math.max(maxH, h);
        }
      }
      rowHeights[r] = maxH;
    }

    // Determine start and end rows
    let acc = 0;
    let foundStart = false;
    let startRowCalc = 0;
    let endRowCalc = rows - 1;

    for (let r = 0; r < rows; r++) {
      const rh = rowHeights[r];
      const bottom = acc + rh;

      if (!foundStart && bottom > st) {
        startRowCalc = Math.max(0, r - overscan);
        foundStart = true;
      }

      if (bottom > st + vh) {
        endRowCalc = Math.min(rows - 1, r + overscan);
        break;
      }

      acc = bottom + (r < rows - 1 ? gap : 0);
    }

    // Compute offsetY as the sum of preceding rows + gaps
    let offsetY = 0;
    for (let r = 0; r < startRowCalc; r++) {
      offsetY += rowHeights[r];
      if (r < startRowCalc) offsetY += gap;
    }
    // Remove trailing gap added after the last preceding row
    if (startRowCalc > 0) {
      offsetY -= gap;
    }

    const startIndex = Math.max(0, startRowCalc * columns);
    const endIndex = Math.min(items.length - 1, (endRowCalc + 1) * columns - 1);

    return { startIndex, endIndex, offsetY: Math.max(0, offsetY) };
  }, [
    items.length,
    columns,
    scrollTop,
    viewportHeight,
    itemHeight,
    gap,
    overscan,
    getActualItemHeight
  ]);

  // Compute total scrollable height (render-safe)
  const totalHeight = useMemo(() => {
    if (!items.length) return 0;

    if (typeof itemHeight === 'number') {
      const rows = Math.ceil(items.length / columns);
      return rows * itemHeight + Math.max(0, rows - 1) * gap;
    }

    const rows = Math.ceil(items.length / columns);
    let total = 0;

    for (let r = 0; r < rows; r++) {
      let maxH = 0;
      for (let c = 0; c < columns; c++) {
        const idx = r * columns + c;
        if (idx < items.length) {
          const h = getActualItemHeight(idx);
          maxH = Math.max(maxH, h);
        }
      }
      total += maxH;
      if (r < rows - 1) total += gap;
    }

    return total;
  }, [items.length, columns, itemHeight, gap, getActualItemHeight]);

  // Scroll handler (no refs accessed during render)
  const handleScroll = useCallback(
    (e) => {
      const scrollTopValue = e.target.scrollTop;
      setScrollTop(scrollTopValue);
      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      if (onScroll) onScroll(e);

      if (loadMore && hasMore && !loading) {
        const scrollHeight = e.target.scrollHeight;
        const scrollPosition = scrollTopValue + e.target.clientHeight;
        const threshold = 200; // 200px from bottom
        if (scrollHeight - scrollPosition < threshold) {
          loadMore();
        }
      }
    },
    [onScroll, loadMore, hasMore, loading]
  );

  // Observe item heights for dynamic sizing (effect observes DOM; render uses heightsMap state)
  useEffect(() => {
    if (typeof itemHeight === 'number') return;
    const root = scrollContainerRef.current;
    if (!root) return;

    // Disconnect any prior observer
    if (itemsResizeObserverRef.current) {
      itemsResizeObserverRef.current.disconnect();
    }

    const ro = new ResizeObserver((entries) => {
      let changed = false;
      const next = { ...itemHeightsRef.current };

      entries.forEach((entry) => {
        const i = parseInt(entry.target.dataset.index, 10);
        const h = entry.contentRect.height;
        if (!Number.isNaN(i) && h > 0 && next[i] !== h) {
          next[i] = h;
          changed = true;
        }
      });

      if (changed) {
        itemHeightsRef.current = next;
        schedule(() => setHeightsMap(next));
      }
    });

    itemsResizeObserverRef.current = ro;

    // Observe after paint to ensure nodes are present
    const raf = requestAnimationFrame(() => {
      const nodes = root.querySelectorAll('[data-virtual-item]');
      nodes.forEach((n) => ro.observe(n));
    });

    return () => {
      cancelAnimationFrame(raf);
      if (itemsResizeObserverRef.current) {
        itemsResizeObserverRef.current.disconnect();
        itemsResizeObserverRef.current = null;
      }
    };
  }, [items, columns, itemHeight]);

  // Cleanup scroll timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const { startIndex, endIndex, offsetY } = visibleRange;
  const visibleItems =
    startIndex <= endIndex ? items.slice(startIndex, endIndex + 1) : [];

  return (
    <div
      ref={scrollContainerRef}
      className={`virtual-scroll-container ${className} ${isScrolling ? 'is-scrolling' : ''}`}
      style={{
        height: containerHeight || '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Total height placeholder */}
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* Visible items container */}
        <div
          className="virtual-scroll-viewport"
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: columns > 1 ? 'grid' : 'block',
            gridTemplateColumns: columns > 1 ? `repeat(${columns}, 1fr)` : undefined,
            gap: gap,
            willChange: isScrolling ? 'transform' : 'auto'
          }}
        >
          {visibleItems.map((item, i) => {
            const actualIndex = startIndex + i;
            return (
              <div
                key={item?.id ?? actualIndex}
                data-index={actualIndex}
                data-virtual-item
                className="virtual-scroll-item"
                style={{
                  minHeight: estimatedItemHeight,
                  contain: 'layout style paint'
                }}
              >
                {renderItem(item, actualIndex, isScrolling)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="virtual-scroll-loading">
          <div className="loading-spinner"></div>
          <span>Loading more...</span>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && items.length > 0 && (
        <div className="virtual-scroll-end">
          <span>No more items to load</span>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <div className="virtual-scroll-empty">
          <span>No items to display</span>
        </div>
      )}
    </div>
  );
});

VirtualScroll.displayName = 'VirtualScroll';

export default VirtualScroll;