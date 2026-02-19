import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Canvas,
  Ellipse,
  IText,
  Line,
  Path,
  PencilBrush,
  Point,
  Rect,
  Triangle,
  type TPointerEventInfo,
  type TPointerEvent,
  type FabricObject,
} from 'fabric';
import { useCanvas } from './CanvasProvider';
import SketchBottomBar from './SketchBottomBar';
import PathEditorOverlay, { applyNodesToFabric, type NodePoint } from './PathEditorOverlay';

const LAYER_NAME_MAP: Record<string, string> = {
  rect: '사각형',
  ellipse: '원',
  triangle: '삼각형',
  line: '선',
  'i-text': '텍스트',
  path: '펜',
  image: '이미지',
  arrow: '화살표',
};

let objCounter = 0;
function makeData(type: string) {
  objCounter += 1;
  return { id: `${type}-${Date.now()}-${objCounter}`, name: LAYER_NAME_MAP[type] ?? type };
}

interface WorksheetSketchViewProps {
  zoom: number;
  onZoomChange: (z: number) => void;
}

export default function WorksheetSketchView({ zoom, onZoomChange }: WorksheetSketchViewProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const activeShapeRef = useRef<FabricObject | null>(null);

  const {
    canvasRef,
    registerCanvas,
    activeTool,
    setActiveTool,
    fillColor,
    strokeColor,
    strokeWidth,
    showGrid,
    saveHistory,
    refreshLayers,
    deleteSelected,
    groupSelected,
    ungroupSelected,
  } = useCanvas();

  const [localZoom, setLocalZoom] = useState(zoom);
  const [pathEditingPath, setPathEditingPath] = useState<Path | null>(null);

  const handlePathEditDone = useCallback(
    (nodes: NodePoint[]) => {
      const canvas = fabricRef.current;
      if (!canvas || !pathEditingPath) return;
      applyNodesToFabric(pathEditingPath, nodes, canvas);
      setPathEditingPath(null);
      canvas.selection = activeTool === 'select';
      canvas.renderAll();
      saveHistory();
      refreshLayers();
    },
    [pathEditingPath, activeTool, saveHistory, refreshLayers],
  );

  const handleZoomChange = (z: number) => {
    setLocalZoom(z);
    onZoomChange(z);
  };

  useEffect(() => {
    setLocalZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const el = canvasElRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const canvas = new Canvas(el, {
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });
    fabricRef.current = canvas;
    canvasRef.current = canvas;
    registerCanvas(canvas);

    const resizeCanvas = () => {
      const c = containerRef.current;
      const fc = fabricRef.current;
      if (!c || !fc) return;
      const { clientWidth, clientHeight } = c;
      if (clientWidth === 0 || clientHeight === 0) return;
      fc.setDimensions({ width: clientWidth, height: clientHeight });
      fc.renderAll();
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
      fabricRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const cx = canvas.getWidth() / 2;
    const cy = canvas.getHeight() / 2;
    canvas.zoomToPoint(new Point(cx, cy), localZoom / 100);
    canvas.renderAll();
  }, [localZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const canvas = fabricRef.current;
      if (!canvas) return;
      let zoom = canvas.getZoom() * Math.exp(-e.deltaY * 0.001);
      zoom = Math.max(0.1, Math.min(5, zoom));
      canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
      const zoomPct = Math.round(zoom * 100);
      setLocalZoom(zoomPct);
      onZoomChange(zoomPct);
      canvas.renderAll();
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [onZoomChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pan = { active: false, lastX: 0, lastY: 0 };
    const space = { down: false };

    const getUpperCanvas = () =>
      (fabricRef.current as unknown as { upperCanvasEl?: HTMLCanvasElement })?.upperCanvasEl;

    const setCursor = (cursor: string) => {
      const el = getUpperCanvas();
      if (el) el.style.cursor = cursor;
    };

    const overrideFabricCursor = (cursor: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.defaultCursor = cursor;
      canvas.hoverCursor = cursor;
    };

    const restoreFabricCursor = () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    };

    const startPan = (x: number, y: number) => {
      pan.active = true;
      pan.lastX = x;
      pan.lastY = y;
      overrideFabricCursor('grabbing');
      setCursor('grabbing');
    };

    const stopPan = () => {
      pan.active = false;
      restoreFabricCursor();
      if (space.down) {
        overrideFabricCursor('grab');
        setCursor('grab');
      } else {
        setCursor('');
      }
    };

    const isTextFocused = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isTextFocused()) {
        e.preventDefault();
        space.down = true;
        if (!pan.active) {
          overrideFabricCursor('grab');
          setCursor('grab');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        space.down = false;
        if (pan.active) stopPan();
        else {
          restoreFabricCursor();
          setCursor('');
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        startPan(e.clientX, e.clientY);
      } else if (e.button === 0 && space.down) {
        e.stopPropagation();
        startPan(e.clientX, e.clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!pan.active) return;
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.relativePan(new Point(e.clientX - pan.lastX, e.clientY - pan.lastY));
      pan.lastX = e.clientX;
      pan.lastY = e.clientY;
      canvas.renderAll();
      setCursor('grabbing');
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (pan.active && (e.button === 1 || e.button === 0)) stopPan();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown, { capture: true });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown, { capture: true });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const isTextFocused = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTextFocused()) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'g') {
        e.preventDefault();
        groupSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        ungroupSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, groupSelected, ungroupSelected]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = showGrid ? '' : '#ffffff';
    canvas.renderAll();
  }, [showGrid]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const handleDblClick = (opt: TPointerEventInfo<TPointerEvent>) => {
      const target = opt.target;
      if (target instanceof Path && !pathEditingPath) {
        setPathEditingPath(target);
        setActiveTool('select');
        canvas.discardActiveObject();
        canvas.selection = false;
        canvas.renderAll();
      }
    };
    canvas.on('mouse:dblclick', handleDblClick);
    return () => {
      canvas.off('mouse:dblclick', handleDblClick);
    };
  }, [pathEditingPath, setActiveTool]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (pathEditingPath) {
      canvas.selection = false;
      canvas.defaultCursor = 'default';
    } else {
      canvas.selection = activeTool === 'select';
      canvas.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair';
    }
  }, [pathEditingPath, activeTool]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = activeTool === 'select';
    canvas.defaultCursor = activeTool === 'select' ? 'default' : 'crosshair';

    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (activeTool === 'select') return;
      const pointer = canvas.getScenePoint(opt.e);
      drawStartRef.current = { x: pointer.x, y: pointer.y };

      if (activeTool === 'text') {
        const text = new IText('텍스트', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 20,
          fill: fillColor,
          fontFamily: 'sans-serif',
        });
        (text as unknown as { data: unknown }).data = makeData('i-text');
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.renderAll();
        saveHistory();
        refreshLayers();
        setActiveTool('select');
        return;
      }

      if (activeTool === 'rect') {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        (rect as unknown as { data: unknown }).data = makeData('rect');
        activeShapeRef.current = rect;
        canvas.add(rect);
        canvas.renderAll();
      }

      if (activeTool === 'ellipse') {
        const ellipse = new Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        (ellipse as unknown as { data: unknown }).data = makeData('ellipse');
        activeShapeRef.current = ellipse;
        canvas.add(ellipse);
        canvas.renderAll();
      }

      if (activeTool === 'triangle') {
        const tri = new Triangle({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        (tri as unknown as { data: unknown }).data = makeData('triangle');
        activeShapeRef.current = tri;
        canvas.add(tri);
        canvas.renderAll();
      }

      if (activeTool === 'line' || activeTool === 'arrow') {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: strokeColor,
          strokeWidth,
          selectable: false,
          evented: false,
        });
        (line as unknown as { data: unknown }).data = makeData('line');
        activeShapeRef.current = line;
        canvas.add(line);
        canvas.renderAll();
      }
    };

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!drawStartRef.current || !activeShapeRef.current) return;
      const pointer = canvas.getScenePoint(opt.e);
      const { x: startX, y: startY } = drawStartRef.current;
      const shape = activeShapeRef.current;

      if (activeTool === 'rect') {
        const rect = shape as Rect;
        rect.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
        });
        rect.setCoords();
      }

      if (activeTool === 'ellipse') {
        const ellipse = shape as Ellipse;
        ellipse.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          rx: Math.abs(pointer.x - startX) / 2,
          ry: Math.abs(pointer.y - startY) / 2,
        });
        ellipse.setCoords();
      }

      if (activeTool === 'triangle') {
        const tri = shape as Triangle;
        tri.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.abs(pointer.x - startX),
          height: Math.abs(pointer.y - startY),
        });
        tri.setCoords();
      }

      if (activeTool === 'line' || activeTool === 'arrow') {
        const line = shape as Line;
        line.set({ x2: pointer.x, y2: pointer.y });
        line.setCoords();
      }

      canvas.renderAll();
    };

    const handleMouseUp = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!drawStartRef.current) return;
      const pointer = canvas.getScenePoint(opt.e);
      const { x: startX, y: startY } = drawStartRef.current;

      if (activeTool === 'arrow' && activeShapeRef.current) {
        canvas.remove(activeShapeRef.current);
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const angle = Math.atan2(dy, dx);
        const len = Math.sqrt(dx * dx + dy * dy);
        const headLen = Math.max(10, Math.min(len * 0.3, 20));
        const headAngle = Math.PI / 6;
        const tip = { x: pointer.x, y: pointer.y };
        const tail = { x: startX, y: startY };
        const wing1 = {
          x: tip.x - headLen * Math.cos(angle - headAngle),
          y: tip.y - headLen * Math.sin(angle - headAngle),
        };
        const wing2 = {
          x: tip.x - headLen * Math.cos(angle + headAngle),
          y: tip.y - headLen * Math.sin(angle + headAngle),
        };
        const pathData = `M ${tail.x} ${tail.y} L ${tip.x} ${tip.y} M ${wing1.x} ${wing1.y} L ${tip.x} ${tip.y} L ${wing2.x} ${wing2.y}`;
        const arrow = new Path(pathData, {
          stroke: strokeColor,
          strokeWidth,
          fill: '',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        });
        (arrow as unknown as { data: unknown }).data = makeData('arrow');
        canvas.add(arrow);
        canvas.setActiveObject(arrow);
      } else if (activeShapeRef.current) {
        canvas.setActiveObject(activeShapeRef.current);
      }

      drawStartRef.current = null;
      activeShapeRef.current = null;
      canvas.renderAll();
      saveHistory();
      refreshLayers();
      setActiveTool('select');
    };

    if (activeTool === 'draw') {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = strokeColor;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;

      const handlePathCreated = () => saveHistory();
      canvas.on('path:created', handlePathCreated);
      return () => {
        canvas.isDrawingMode = false;
        canvas.off('path:created', handlePathCreated);
      };
    }

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.isDrawingMode = false;
    };
  }, [activeTool, fillColor, strokeColor, strokeWidth, saveHistory, setActiveTool, refreshLayers]);

  return (
    <div
      ref={containerRef}
      className='relative h-full w-full overflow-hidden rounded-md bg-[#e0e0e0]'
    >
      {showGrid && (
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundColor: '#ffffff',
            backgroundImage:
              'linear-gradient(to right, rgba(255,0,0,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,0,0,0.25) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
      )}
      <canvas ref={canvasElRef} />
      {pathEditingPath && fabricRef.current && (
        <PathEditorOverlay
          canvas={fabricRef.current}
          path={pathEditingPath}
          onDone={handlePathEditDone}
        />
      )}
      <SketchBottomBar zoom={localZoom} onZoomChange={handleZoomChange} />
    </div>
  );
}
