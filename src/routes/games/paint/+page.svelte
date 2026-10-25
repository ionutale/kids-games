<script>
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { settings } from '$lib/stores/settings';
  import { _ } from '$lib/stores/locale';
  import { playTap, playPop, playSplash } from '$lib/sounds/audioManager';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import StampDefs from '$lib/paint/StampDefs.svelte';
  import PaintStamp from '$lib/paint/PaintStamp.svelte';
  import PaintDock from '$lib/paint/PaintDock.svelte';
  import PaintPalette from '$lib/paint/PaintPalette.svelte';
  import PaintStampTray from '$lib/paint/PaintStampTray.svelte';
  import PaintPaperTray from '$lib/paint/PaintPaperTray.svelte';
  import PaintClearCard from '$lib/paint/PaintClearCard.svelte';
  import PaintPaperThumb from '$lib/paint/PaintPaperThumb.svelte';
  import { getSheet, getSheets } from '$lib/paint/sheets.js';
  import { getSheetArt, SHEET_REGION_IDS } from '$lib/paint/sheetArt.js';
  import { getToolsForAge } from '$lib/paint/tools.js';
  import { createPaintDocument } from '$lib/paint/document.js';
  import { getStorage, loadPaint, savePaint } from '$lib/paint/save.js';
  import {
    isTap,
    toNormalized,
    MIN_POINT_DISTANCE_PX,
    DEFAULT_ARTBOARD
  } from '$lib/paint/geometry.js';

  // Eraser passes live in the sheet as regular strokes with this sentinel
  // colour, so they save, reload and undo with the rest of the artwork. The
  // palette is hex-only, so it can never collide with a real paint colour.
  const ERASE_COLOR = 'erase';

  const isAge2 = $derived(
    Number.isFinite($settings.ageLevel) && $settings.ageLevel <= 2
  );
  const tools = $derived(getToolsForAge($settings.ageLevel));
  const sheetList = $derived(getSheets($settings.ageLevel));

  let rootEl = $state(null);
  let canvasEl = $state(null);
  let paperChipEl = $state(null);
  let clearChipEl = $state(null);
  let dockInstance = $state(null);

  let sheetId = $state('blank');
  let sheet = $state({ kind: 'free', strokes: [], stamps: [] });
  let canUndo = $state(false);
  let tool = $state('brush');
  let colorId = $state('coral');
  let brushIndex = $state(0);
  let stampType = $state('star');
  let paletteOpen = $state(false);
  let stampTrayOpen = $state(false);
  let paperTrayOpen = $state(false);
  let clearOpen = $state(false);

  let mapping = $state({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    artW: DEFAULT_ARTBOARD.width,
    artH: DEFAULT_ARTBOARD.height,
    dpr: 1
  });

  const isColoring = $derived(getSheet(sheetId)?.kind === 'coloring');
  const activeArt = $derived(getSheetArt(sheetId));
  const activeSheetMeta = $derived(getSheet(sheetId) ?? getSheet('blank'));
  const currentColor = $derived(
    tools.colors.find((color) => color.id === colorId) ?? tools.colors[0]
  );
  const brushIndexSafe = $derived(
    Math.min(brushIndex, tools.brushSizes.length - 1)
  );
  const currentBrush = $derived(tools.brushSizes[brushIndexSafe]);
  const currentStamp = $derived(
    tools.stamps.find((stamp) => stamp.type === stampType) ?? tools.stamps[0]
  );

  // Stamps are SVG stickers positioned with the same artboard mapping as the
  // canvas and the line art, so they survive every resize.
  const stampViews = $derived.by(() => {
    const view = mapping;
    return (sheet.stamps ?? []).map((stamp, index) => ({
      key: index,
      type: stamp.type,
      left: view.offsetX + stamp.x * view.artW * view.scale,
      top: view.offsetY + stamp.y * view.artH * view.scale,
      px: stamp.size * view.scale
    }));
  });

  // The document is imperative and owns the undo history; `sheet` is the
  // reactive snapshot the template reads after every committed action.
  let doc = null;
  let storage = null;
  let allSheets = {};

  let canvasCtx = null;
  let regionPaths = new Map();
  let clipSets = new Map();
  let hitCtx = null;
  let resizeObserver = null;

  let activePointer = null;
  let gesture = null;

  function soundTap() {
    if ($settings.soundEnabled) playTap();
  }

  function soundPop() {
    if ($settings.soundEnabled) playPop();
  }

  function soundSplash() {
    if ($settings.soundEnabled) playSplash();
  }

  function sync() {
    if (!doc) return;
    sheet = doc.toJSON();
    canUndo = doc.canUndo;
  }

  function persist(write = true) {
    if (!doc) return;
    allSheets[sheetId] = doc.toJSON();
    if (write) {
      savePaint(storage, { activeSheet: sheetId, sheets: allSheets });
    }
  }

  function saveNow() {
    persist(true);
  }

  function openSheet(id) {
    sheetId = id;
    doc = createPaintDocument(id);
    if (allSheets[id]) doc.load(allSheets[id]);
    if (getSheet(id)?.kind !== 'coloring' && tool === 'bucket') {
      tool = 'brush';
    }
    buildRegions();
    buildClipSets();
    sync();
  }

  // Regions come from the active sheet's registry entry, so hit-testing and
  // clipping always follow the same back-to-front list the line art draws.
  let activeRegions = [];

  function buildRegions() {
    regionPaths = new Map();
    hitCtx = null;
    const art = getSheetArt(sheetId);
    activeRegions = art?.regions ?? [];
    if (!art) return;

    for (const region of activeRegions) {
      regionPaths.set(region.id, new Path2D(region.d));
    }
    const hitCanvas = document.createElement('canvas');
    hitCanvas.width = art.viewbox.width;
    hitCanvas.height = art.viewbox.height;
    hitCtx = hitCanvas.getContext('2d');
  }

  /**
   * A colouring stroke must stop at every region drawn in front of its own:
   * clip to the start region, then subtract each later (higher) region with an
   * even-odd complement mask. Successive clips intersect, so nested or
   * partially overlapping foreground regions are removed as a union instead
   * of a parity puzzle. The mask logic is driven purely by the region list.
   */
  function buildClipSets() {
    clipSets = new Map();
    const span = 100000;
    for (let index = 0; index < activeRegions.length; index += 1) {
      const start = regionPaths.get(activeRegions[index].id);
      const holes = [];
      for (let higher = index + 1; higher < activeRegions.length; higher += 1) {
        const path = regionPaths.get(activeRegions[higher].id);
        if (!path) continue;
        // Large rect + region path, clipped even-odd: the complement of the
        // region inside the rect, i.e. everything except that foreground shape.
        const mask = new Path2D();
        mask.rect(-span, -span, span * 2, span * 2);
        mask.addPath(path);
        holes.push(mask);
      }
      clipSets.set(activeRegions[index].id, { start, holes });
    }
  }

  /** Apply the start-region clip plus foreground-region holes. Caller saves. */
  function applyRegionClip(ctx, regionId) {
    const set = clipSets.get(regionId);
    if (!set || !set.start) return false;
    ctx.clip(set.start);
    for (const hole of set.holes) {
      ctx.clip(hole, 'evenodd');
    }
    return true;
  }

  /** Top-most region under an artboard point (document order is back-to-front). */
  function hitRegion(artX, artY) {
    if (!hitCtx) return null;
    for (let index = activeRegions.length - 1; index >= 0; index -= 1) {
      const region = activeRegions[index];
      const path = regionPaths.get(region.id);
      if (path && hitCtx.isPointInPath(path, artX, artY)) return region;
    }
    return null;
  }

  function artboardRect() {
    const view = mapping;
    return {
      left: view.left + view.offsetX,
      top: view.top + view.offsetY,
      width: view.artW * view.scale,
      height: view.artH * view.scale
    };
  }

  function mapPointer(event) {
    const view = mapping;
    if (!view.width || !view.height) return null;
    const normalized = toNormalized(
      { x: event.clientX, y: event.clientY },
      artboardRect()
    );
    return {
      normalized,
      artX: normalized.x * view.artW,
      artY: normalized.y * view.artH
    };
  }

  function measure() {
    if (!rootEl) return;
    const rect = rootEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const art = getSheetArt(sheetId);

    let artW = rect.width;
    let artH = rect.height;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (art) {
      artW = art.viewbox.width;
      artH = art.viewbox.height;
      scale = Math.max(rect.width / artW, rect.height / artH);
      offsetX = (rect.width - artW * scale) / 2;
      offsetY = (rect.height - artH * scale) / 2;
    }

    mapping = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      scale,
      offsetX,
      offsetY,
      artW,
      artH,
      dpr
    };

    if (!canvasEl) return;
    const backingW = Math.max(1, Math.round(rect.width * dpr));
    const backingH = Math.max(1, Math.round(rect.height * dpr));
    if (canvasEl.width !== backingW || canvasEl.height !== backingH) {
      canvasEl.width = backingW;
      canvasEl.height = backingH;
    }
    canvasEl.style.width = `${rect.width}px`;
    canvasEl.style.height = `${rect.height}px`;
    canvasCtx = canvasEl.getContext('2d');
    applyTransform();
  }

  function applyTransform() {
    if (!canvasCtx) return;
    const view = mapping;
    canvasCtx.setTransform(
      view.dpr * view.scale,
      0,
      0,
      view.dpr * view.scale,
      view.dpr * view.offsetX,
      view.dpr * view.offsetY
    );
  }

  function tracePoints(ctx, points) {
    const view = mapping;
    ctx.beginPath();
    ctx.moveTo(points[0].x * view.artW, points[0].y * view.artH);
    for (let index = 1; index < points.length; index += 1) {
      ctx.lineTo(points[index].x * view.artW, points[index].y * view.artH);
    }
  }

  function drawStroke(ctx, stroke) {
    const view = mapping;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;

    if (stroke.points.length === 1) {
      ctx.beginPath();
      ctx.arc(
        stroke.points[0].x * view.artW,
        stroke.points[0].y * view.artH,
        stroke.size / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      return;
    }

    tracePoints(ctx, stroke.points);
    ctx.stroke();
  }

  function paintStroke(stroke) {
    const ctx = canvasCtx;
    if (!ctx || stroke.points.length === 0) return;
    ctx.save();
    if (stroke.color === ERASE_COLOR) {
      // Saved eraser passes replay as paint removal, below the line art and
      // the sticker layer, never touching the sheet's fills.
      ctx.globalCompositeOperation = 'destination-out';
      drawStroke(ctx, { ...stroke, color: '#000000' });
      ctx.restore();
      return;
    }
    if (stroke.region && !applyRegionClip(ctx, stroke.region)) {
      ctx.restore();
      return;
    }
    drawStroke(ctx, stroke);
    ctx.restore();
  }

  function redraw() {
    if (!canvasEl) return;
    canvasCtx = canvasEl.getContext('2d');
    if (!canvasCtx) return;

    canvasCtx.setTransform(1, 0, 0, 1, 0, 0);
    canvasCtx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    applyTransform();

    const active = doc?.sheet;
    if (!active) return;

    // Strokes replay in document order, so a saved eraser pass keeps erasing
    // exactly the paint that came before it.
    for (const stroke of active.strokes) {
      paintStroke(stroke);
    }
  }

  /** Live dot while a stroke is in progress; the clip is already active. */
  function paintDotLive(point, size, color) {
    const ctx = canvasCtx;
    if (!ctx) return;
    const view = mapping;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x * view.artW, point.y * view.artH, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Live segment while a stroke is in progress; the clip is already active. */
  function paintSegmentLive(from, to, size, color) {
    const ctx = canvasCtx;
    if (!ctx) return;
    const view = mapping;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(from.x * view.artW, from.y * view.artH);
    ctx.lineTo(to.x * view.artW, to.y * view.artH);
    ctx.stroke();
  }

  /** Save + clip for a colouring stroke. Pair with restore in endGesture. */
  function beginStrokeClip(regionId) {
    const ctx = canvasCtx;
    if (!ctx || !clipSets.has(regionId)) return false;
    ctx.save();
    applyRegionClip(ctx, regionId);
    return true;
  }

  function eraseDot(point, size) {
    const ctx = canvasCtx;
    if (!ctx) return;
    const view = mapping;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(point.x * view.artW, point.y * view.artH, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function eraseSegment(from, to, size) {
    const ctx = canvasCtx;
    if (!ctx) return;
    const view = mapping;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(from.x * view.artW, from.y * view.artH);
    ctx.lineTo(to.x * view.artW, to.y * view.artH);
    ctx.stroke();
    ctx.restore();
  }

  function eraserSize() {
    return isAge2 ? 44 : 32;
  }

  function beginGesture(event, state) {
    activePointer = event.pointerId;
    gesture = state;
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  }

  function detachGestureListeners() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
  }

  function endGesture() {
    // Colouring strokes hold a saved clip for the whole gesture so each move
    // does not rebuild the foreground holes.
    if (gesture?.clipped) canvasCtx?.restore();
    detachGestureListeners();
    activePointer = null;
    gesture = null;
  }

  function cancelGesture() {
    if (!activePointer && !gesture) return;
    if (gesture?.kind === 'brush') doc?.cancelStroke();
    endGesture();
    redraw();
  }

  function onPointerDown(event) {
    if (!doc || clearOpen || paperTrayOpen) return;
    if (activePointer !== null) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.isPrimary === false) return;

    const at = mapPointer(event);
    if (!at) return;
    event.preventDefault();

    if (tool === 'bucket') {
      useBucket(at);
      return;
    }

    if (tool === 'stamp') {
      placeStamp(at);
      return;
    }

    if (tool === 'eraser') {
      beginGesture(event, {
        kind: 'eraser',
        size: eraserSize(),
        startClient: { x: event.clientX, y: event.clientY },
        startPoint: at.normalized,
        last: at.normalized,
        points: [],
        started: false
      });
      return;
    }

    startBrush(event, at);
  }

  function startBrush(event, at) {
    const region = isColoring ? hitRegion(at.artX, at.artY) : null;
    // On a coloring sheet a stroke must begin inside a region: the line art is
    // never a paint target and the whole bleed is not one plane.
    if (isColoring && !region) return;

    if (
      !doc.beginStroke({
        color: currentColor.value,
        size: currentBrush.size,
        region: region?.id ?? null
      })
    ) {
      return;
    }

    if (!doc.appendPoint(at.normalized)) {
      doc.cancelStroke();
      return;
    }

    const clipped = region ? beginStrokeClip(region.id) : false;
    if (region && !clipped) {
      doc.cancelStroke();
      return;
    }

    beginGesture(event, {
      kind: 'brush',
      color: currentColor.value,
      size: currentBrush.size,
      regionId: region?.id ?? null,
      last: at.normalized,
      clipped
    });

    paintDotLive(at.normalized, currentBrush.size, currentColor.value);
  }

  function moveBrush(event) {
    if (!gesture || !doc) return;
    const at = mapPointer(event);
    if (!at) return;
    if (!doc.appendPoint(at.normalized)) return;
    paintSegmentLive(
      gesture.last,
      at.normalized,
      gesture.size,
      gesture.color
    );
    gesture.last = at.normalized;
  }

  function farEnough(from, to) {
    const view = mapping;
    return (
      Math.hypot((to.x - from.x) * view.artW, (to.y - from.y) * view.artH) >=
      MIN_POINT_DISTANCE_PX
    );
  }

  function moveErase(event) {
    if (!gesture) return;
    const at = mapPointer(event);
    if (!at) return;

    if (!gesture.started) {
      if (isTap(gesture.startClient, { x: event.clientX, y: event.clientY })) {
        return;
      }
      gesture.started = true;
      gesture.points = [gesture.startPoint];
      eraseDot(gesture.startPoint, gesture.size);
    }

    if (!farEnough(gesture.last, at.normalized)) return;
    eraseSegment(gesture.last, at.normalized, gesture.size);
    gesture.points.push(at.normalized);
    gesture.last = at.normalized;
  }

  function finishErase(event) {
    if (!gesture || !doc) return;

    if (!gesture.started) {
      if (!isTap(gesture.startClient, { x: event.clientX, y: event.clientY })) {
        // No move event arrived before pointerup; treat the trip as a drag from
        // the start point so a fast diagonal swipe still erases.
        gesture.started = true;
        gesture.points = [gesture.startPoint];
        eraseDot(gesture.startPoint, gesture.size);
      } else {
        eraseTap(gesture.startPoint);
        return;
      }
    }

    if (gesture.points.length === 0) return;
    commitErase(gesture.points, gesture.size);
  }

  /**
   * An eraser pass is a normal document stroke with the 'erase' sentinel, so it
   * is saved, reloaded, and undone with the rest of the sheet. The canvas
   * replays it with `destination-out`; fills and stamps are unaffected.
   */
  function commitErase(points, size) {
    if (!doc) return;
    const stroke = doc.addStroke({
      color: ERASE_COLOR,
      size,
      region: null,
      points
    });
    if (!stroke) return;
    sync();
    persist(true);
  }

  function eraseTap(point) {
    if (!doc) return;

    if (isColoring) {
      const region = hitRegion(point.x * mapping.artW, point.y * mapping.artH);
      if (region && doc.sheet.fills?.[region.id] && doc.clearFill(region.id)) {
        sync();
        persist(true);
        soundPop();
      }
      return;
    }

    eraseDot(point, eraserSize());
    commitErase([point], eraserSize());
  }

  function onPointerMove(event) {
    if (!gesture || event.pointerId !== activePointer) return;
    event.preventDefault();
    if (gesture.kind === 'brush') moveBrush(event);
    else moveErase(event);
  }

  function onPointerUp(event) {
    if (!gesture || event.pointerId !== activePointer) return;

    if (gesture.kind === 'brush') {
      moveBrush(event);
      const stroke = doc?.endStroke();
      endGesture();
      if (stroke) {
        sync();
        persist(true);
      }
      return;
    }

    finishErase(event);
    endGesture();
  }

  function onPointerCancel(event) {
    if (!gesture || event.pointerId !== activePointer) return;
    cancelGesture();
  }

  function onWindowBlur() {
    if (activePointer !== null) cancelGesture();
  }

  function useBucket(at) {
    if (!doc || !isColoring) return;
    const region = hitRegion(at.artX, at.artY);
    if (!region) return;
    if (doc.setFill(region.id, currentColor.value)) {
      sync();
      persist(true);
      soundPop();
    }
  }

  function placeStamp(at) {
    if (!doc) return;
    const placed = doc.addStamp({
      type: currentStamp.type,
      x: at.normalized.x,
      y: at.normalized.y,
      size: isAge2 ? 64 : 56
    });
    if (!placed) return;
    sync();
    persist(true);
    soundSplash();
  }

  function undo() {
    if (!doc || activePointer !== null) return;
    if (!doc.undo()) return;
    sync();
    redraw();
    persist(true);
    soundPop();
  }

  function selectBrush() {
    if (activePointer !== null) return;
    const count = tools.brushSizes.length;
    brushIndex = (Math.min(brushIndex, count - 1) + 1) % count;
    tool = 'brush';
    paletteOpen = false;
    stampTrayOpen = false;
    soundTap();
  }

  function selectBucket() {
    if (activePointer !== null || !isColoring) return;
    tool = 'bucket';
    paletteOpen = false;
    stampTrayOpen = false;
    soundTap();
  }

  function selectEraser() {
    if (activePointer !== null) return;
    tool = 'eraser';
    paletteOpen = false;
    stampTrayOpen = false;
    soundTap();
  }

  function togglePalette() {
    if (activePointer !== null) return;
    stampTrayOpen = false;
    paletteOpen = !paletteOpen;
    soundTap();
  }

  function closePalette() {
    paletteOpen = false;
    dockInstance?.focusWell();
  }

  function selectColor(color) {
    colorId = color.id;
    paletteOpen = false;
    soundTap();
    dockInstance?.focusWell();
  }

  function openStampTray() {
    if (activePointer !== null) return;
    paletteOpen = false;
    stampTrayOpen = true;
    soundTap();
  }

  function closeStampTray() {
    stampTrayOpen = false;
    dockInstance?.focusStamp();
  }

  function selectStamp(stamp) {
    stampType = stamp.type;
    tool = 'stamp';
    stampTrayOpen = false;
    soundTap();
    dockInstance?.focusStamp();
  }

  function openPaperTray() {
    if (activePointer !== null) return;
    paletteOpen = false;
    stampTrayOpen = false;
    paperTrayOpen = true;
    soundTap();
  }

  async function closePaperTray() {
    paperTrayOpen = false;
    await tick();
    paperChipEl?.focus();
  }

  function selectSheet(id) {
    if (activePointer !== null) return;
    if (!sheetList.some((entry) => entry.id === id)) return;
    if (id === sheetId) {
      closePaperTray();
      return;
    }

    // Each sheet remembers its own art: save the current one, load the target.
    persist(true);
    openSheet(id);
    measure();
    redraw();
    persist(true);
    soundTap();
    closePaperTray();
  }

  function openClear() {
    if (activePointer !== null) return;
    paletteOpen = false;
    stampTrayOpen = false;
    paperTrayOpen = false;
    clearOpen = true;
  }

  async function cancelClear() {
    clearOpen = false;
    await tick();
    clearChipEl?.focus();
  }

  async function confirmClear() {
    if (!doc) return;
    doc.clearSheet();
    clearOpen = false;
    sync();
    redraw();
    persist(true);
    soundPop();
    await tick();
    clearChipEl?.focus();
  }

  function onWindowKeydown(event) {
    if (event.key !== 'Escape') return;
    if (clearOpen) return;

    if (paperTrayOpen) {
      event.preventDefault();
      closePaperTray();
      return;
    }
    if (paletteOpen) {
      event.preventDefault();
      closePalette();
      return;
    }
    if (stampTrayOpen) {
      event.preventDefault();
      closeStampTray();
    }
  }

  function handleResize() {
    if (activePointer !== null) cancelGesture();
    measure();
    redraw();
  }

  function onVisibility() {
    if (!document.hidden) return;
    if (activePointer !== null) cancelGesture();
    persist(true);
  }

  function leave() {
    if (activePointer !== null) cancelGesture();
    persist(true);
    goto('/');
  }

  onMount(() => {
    storage = getStorage();
    // Every coloring sheet validates its fills and clipped strokes against its
    // own region ids, so switching or reloading never drops another sheet's art.
    const saved = loadPaint(storage, { regions: SHEET_REGION_IDS });
    allSheets = saved.sheets;

    const available = sheetList.some((entry) => entry.id === saved.activeSheet);
    const initialId = available ? saved.activeSheet : 'blank';
    const mediumIndex = tools.brushSizes.findIndex((size) => size.id === 'medium');
    if (mediumIndex >= 0) brushIndex = mediumIndex;

    openSheet(initialId);
    measure();
    redraw();
    persist(true);

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(rootEl);

    window.addEventListener('pagehide', saveNow);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      saveNow();
      resizeObserver?.disconnect();
      window.removeEventListener('pagehide', saveNow);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      detachGestureListeners();
      doc?.cancelStroke();
    };
  });
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div class="studio" class:age-2={isAge2} bind:this={rootEl}>
  <div class="scene" inert={clearOpen || paperTrayOpen}>
    <div class="paper" aria-hidden="true"></div>

    {#if activeArt}
      {@const SheetPage = activeArt.Page}
      <div class="fills" aria-hidden="true">
        <SheetPage layer="fills" fills={sheet.fills ?? {}} />
      </div>
    {/if}

    <canvas
      class="paint-canvas"
      data-testid="paint-canvas"
      bind:this={canvasEl}
      onpointerdown={onPointerDown}
    ></canvas>

    {#if activeArt}
      {@const SheetPage = activeArt.Page}
      <div class="ink" aria-hidden="true">
        <SheetPage layer="ink" />
      </div>
    {/if}

    <div class="stamps" aria-hidden="true">
      {#each stampViews as stamp (stamp.key)}
        <div
          class="stamp"
          style:left="{stamp.left}px"
          style:top="{stamp.top}px"
          style:width="{stamp.px}px"
          style:height="{stamp.px}px"
        >
          <PaintStamp type={stamp.type} size={stamp.px} />
        </div>
      {/each}
    </div>

    <StampDefs />

    <div class="top-controls">
      <button
        class="chip"
        type="button"
        data-testid="back"
        aria-label={$_('back')}
        onclick={leave}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path
            d="M20.5 7 11 16l9.5 9"
            fill="none"
            stroke="currentColor"
            stroke-width="2.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <button
        class="paper-chip"
        type="button"
        data-testid="paper-chip"
        aria-label={`${$_('paintPaper')}: ${$_(activeSheetMeta.titleKey)}`}
        bind:this={paperChipEl}
        onclick={openPaperTray}
      >
        <span class="thumb-wrap" aria-hidden="true">
          <span class="sheet-back"></span>
          <span class="thumb">
            <PaintPaperThumb sheetId={sheetId} />
          </span>
        </span>
      </button>

      <div class="top-right">
        <SoundToggle />
        <button
          class="chip clear-chip"
          type="button"
          data-testid="paint-clear"
          aria-label={$_('paintClear')}
          bind:this={clearChipEl}
          onclick={openClear}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path
              d="M25 5 17 13"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
            />
            <path d="M18 12 23 17 18 23 12 17Z" fill="currentColor" />
            <path
              d="M12 20 9 25M15 22 13 27M18 23 17 28"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <PaintDock
      bind:this={dockInstance}
      {tools}
      color={currentColor}
      brush={currentBrush}
      brushIndex={brushIndexSafe}
      {tool}
      stamp={currentStamp}
      showBucket={isColoring}
      {canUndo}
      {isAge2}
      oncolor={togglePalette}
      onbrush={selectBrush}
      onbucket={selectBucket}
      onstamp={openStampTray}
      oneraser={selectEraser}
      onundo={undo}
    />

    {#if paletteOpen}
      <PaintPalette
        colors={tools.colors}
        selectedId={colorId}
        onselect={selectColor}
        onclose={closePalette}
      />
    {/if}

    {#if stampTrayOpen}
      <PaintStampTray
        stamps={tools.stamps}
        selectedType={stampType}
        size={isAge2 ? 52 : 44}
        onselect={selectStamp}
        onclose={closeStampTray}
      />
    {/if}
  </div>

  {#if paperTrayOpen}
    <PaintPaperTray
      sheets={sheetList}
      activeId={sheetId}
      onselect={selectSheet}
      onclose={closePaperTray}
    />
  {/if}

  {#if clearOpen}
    <PaintClearCard onconfirm={confirmClear} oncancel={cancelClear} />
  {/if}
</div>

<style>
  .studio {
    --tool: 48px;
    --well: 56px;
    --chip: 48px;
    --pot: 64px;
    --stamp-btn: 64px;
    --dock-space: 88px;
    position: absolute;
    inset: 0;
    overflow: hidden;
    touch-action: none;
    background: #fffefa;
    font-family: var(--font-display);
  }

  .studio.age-2 {
    --tool: 72px;
    --well: 64px;
    --chip: 56px;
    --pot: 72px;
    --stamp-btn: 72px;
    --dock-space: 190px;
  }

  @media (max-width: 360px) {
    .studio {
      --dock-space: 142px;
    }
  }

  .scene {
    position: absolute;
    inset: 0;
  }

  /* Fresh white paper with a whisper of warm grain and a soft edge light. */
  .paper {
    position: absolute;
    inset: 0;
    background-color: #fffefa;
    background-image:
      radial-gradient(120% 70% at 50% 0%, rgba(255, 247, 231, 0.55), rgba(255, 247, 231, 0) 55%),
      radial-gradient(rgba(126, 96, 62, 0.045) 0.5px, rgba(126, 96, 62, 0) 0.6px),
      radial-gradient(rgba(126, 96, 62, 0.035) 0.5px, rgba(126, 96, 62, 0) 0.6px);
    background-size: 100% 100%, 4px 4px, 7px 7px;
    background-position: 0 0, 0 0, 2px 3px;
    box-shadow: inset 0 0 60px rgba(126, 96, 62, 0.06);
  }

  .fills,
  .ink,
  .stamps {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .fills {
    z-index: 1;
  }

  .paint-canvas {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: crosshair;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .ink {
    z-index: 3;
  }

  .stamps {
    z-index: 4;
  }

  .stamp {
    position: absolute;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 5px 5px rgba(74, 50, 30, 0.24));
    line-height: 0;
  }

  .top-controls {
    position: absolute;
    top: calc(8px + var(--safe-top));
    left: calc(10px + var(--safe-left));
    right: calc(10px + var(--safe-right));
    z-index: 25;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    pointer-events: none;
  }

  .chip {
    display: grid;
    place-items: center;
    width: var(--chip);
    height: var(--chip);
    border-radius: 50%;
    color: #2b2118;
    background: rgba(255, 253, 245, 0.94);
    box-shadow:
      0 4px 0 rgba(93, 76, 61, 0.2),
      0 8px 18px rgba(27, 37, 55, 0.18);
    backdrop-filter: blur(6px);
    pointer-events: auto;
    transition: transform 0.12s ease-out;
  }

  .chip svg {
    width: 46%;
    height: 46%;
  }

  .chip:active {
    transform: translateY(1px) scale(0.96);
  }

  .chip:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 3px;
  }

  .top-controls > .chip {
    justify-self: start;
  }

  .clear-chip svg {
    width: 54%;
    height: 54%;
  }

  .paper-chip {
    justify-self: center;
    display: grid;
    place-items: center;
    height: var(--chip);
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(255, 253, 245, 0.94);
    box-shadow:
      0 4px 0 rgba(93, 76, 61, 0.2),
      0 8px 18px rgba(27, 37, 55, 0.18);
    backdrop-filter: blur(6px);
    pointer-events: auto;
    transition: transform 0.12s ease-out;
  }

  .paper-chip:active {
    transform: translateY(1px) scale(0.97);
  }

  .paper-chip:focus-visible {
    outline: 3px solid #2f6fb3;
    outline-offset: 3px;
  }

  .thumb-wrap {
    position: relative;
    display: block;
    width: calc(var(--chip) * 0.62);
    height: calc(var(--chip) * 0.8);
  }

  .sheet-back {
    position: absolute;
    inset: 2px -4px -2px 4px;
    border-radius: 4px;
    background: #fffdf6;
    box-shadow: 0 1px 2px rgba(74, 50, 30, 0.22);
    transform: rotate(7deg);
  }

  .thumb {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 4px;
    background: #fffdf6;
    box-shadow: 0 1px 3px rgba(74, 50, 30, 0.28);
  }

  .top-right {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
  }

  .top-right :global(.sound-btn) {
    width: var(--chip);
    height: var(--chip);
    font-size: 22px;
    background: rgba(255, 253, 245, 0.94);
    box-shadow:
      0 4px 0 rgba(93, 76, 61, 0.2),
      0 8px 18px rgba(27, 37, 55, 0.18);
  }
</style>
