import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Copy,
  LayoutGrid,
  RefreshCw,
  Save,
  Split,
  Table2,
  Type,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WidgetDef {
  id: string;
  title: string;
  description: string;
  styleClass: string;
}

type RegionId = string;

interface WorksheetLayoutState {
  columns: number;
  rows: number;
  leftColumnRate: number;
  middleColumnRate: number;
  topRowRate: number;
  layoutName: string;
  placements: Record<RegionId, string | null>;
}

interface WorksheetLayoutEnvelope {
  version?: string;
  layout?: WorksheetLayoutState;
}

type WorksheetDragPayload =
  | {
      source: 'library';
      widgetId: string;
    }
  | {
      source: 'region';
      widgetId: string;
      sourceRegionId: RegionId;
    };

const LOCAL_LAYOUT_KEY = 'faddit-worksheet-layout-v1';

const EDIT_WIDGETS: WidgetDef[] = [
  {
    id: 'hero',
    title: 'Hero',
    description: '메인 헤더 + 배너',
    styleClass: 'from-sky-100 via-white to-sky-200',
  },
  {
    id: 'gallery',
    title: 'Gallery',
    description: '상품 썸네일 영역',
    styleClass: 'from-amber-100 via-white to-amber-200',
  },
  {
    id: 'description',
    title: 'Description',
    description: '텍스트/요약 블록',
    styleClass: 'from-emerald-100 via-white to-emerald-200',
  },
  {
    id: 'spec',
    title: 'Spec Table',
    description: '규격표 블록',
    styleClass: 'from-violet-100 via-white to-violet-200',
  },
  {
    id: 'review',
    title: 'Review',
    description: '리뷰 카드 목록',
    styleClass: 'from-rose-100 via-white to-rose-200',
  },
  {
    id: 'cta',
    title: 'CTA',
    description: '버튼 중심 액션',
    styleClass: 'from-slate-100 via-white to-slate-200',
  },
];

const DEFAULT_LAYOUT: Array<{ regionId: string; widgetId: string }> = [
  { regionId: '0-0', widgetId: 'hero' },
  { regionId: '0-1', widgetId: 'gallery' },
  { regionId: '1-0', widgetId: 'description' },
  { regionId: '1-1', widgetId: 'spec' },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const buildRegionIds = (rows: number, columns: number): RegionId[] =>
  Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return `${row}-${col}`;
  });

const cloneLayoutState = (state: WorksheetLayoutState): WorksheetLayoutState => ({
  ...state,
  placements: { ...state.placements },
});

const createEmptyLayout = (rows: number, columns: number): Record<RegionId, string | null> =>
  Object.fromEntries(buildRegionIds(rows, columns).map((regionId) => [regionId, null]));

const createDefaultLayout = (): WorksheetLayoutState => {
  const layout: WorksheetLayoutState = {
    columns: 2,
    rows: 2,
    leftColumnRate: 52,
    middleColumnRate: 28,
    topRowRate: 55,
    layoutName: '2x2 분할',
    placements: createEmptyLayout(2, 2),
  };

  DEFAULT_LAYOUT.forEach(({ regionId, widgetId }) => {
    layout.placements[regionId] = widgetId;
  });

  return layout;
};

const isWidgetId = (value: unknown): value is string =>
  typeof value === 'string' && EDIT_WIDGETS.some((widget) => widget.id === value);

const sanitizeRate = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return fallback;
  }

  return clamp(Math.round(value), min, max);
};

const sanitizeInt = (value: unknown, min: number, max: number, fallback: number): number => {
  if (
    typeof value !== 'number' ||
    Number.isNaN(value) ||
    !Number.isFinite(value) ||
    !Number.isInteger(value)
  ) {
    return fallback;
  }

  return clamp(value, min, max);
};

const createLayoutName = (rows: number, columns: number): string => `${rows}행 ${columns}열`;

const normalizeLayoutState = (data: unknown): WorksheetLayoutState | null => {
  const source =
    data &&
    typeof data === 'object' &&
    'layout' in data &&
    typeof (data as WorksheetLayoutEnvelope).layout !== 'undefined'
      ? (data as WorksheetLayoutEnvelope).layout
      : data;

  if (!source || typeof source !== 'object') {
    return null;
  }

  const raw = source as Record<string, unknown>;
  const columns = sanitizeInt(raw.columns, 1, 3, 2);
  const rows = sanitizeInt(raw.rows, 1, 3, 2);
  const layoutName =
    typeof raw.layoutName === 'string' && raw.layoutName.trim().length > 0
      ? raw.layoutName
      : createLayoutName(rows, columns);

  const leftColumnRate = sanitizeRate(
    raw.leftColumnRate,
    10,
    columns === 1 ? 100 : columns === 2 ? 90 : 80,
    columns === 1 ? 100 : columns === 2 ? 52 : 34,
  );
  const middleColumnRate =
    columns >= 3
      ? sanitizeRate(raw.middleColumnRate, 10, Math.max(10, 90 - leftColumnRate - 10), 33)
      : 0;
  const topRowRate = sanitizeRate(
    raw.topRowRate,
    rows === 1 ? 100 : 10,
    rows === 1 ? 100 : 90,
    rows === 1 ? 100 : 55,
  );

  const sourcePlacements =
    raw.placements && typeof raw.placements === 'object'
      ? (raw.placements as Record<string, unknown>)
      : null;

  const nextPlacements = createEmptyLayout(rows, columns);
  const used = new Set<string>();

  buildRegionIds(rows, columns).forEach((regionId) => {
    const value = sourcePlacements?.[regionId];
    if (isWidgetId(value) && !used.has(value)) {
      used.add(value);
      nextPlacements[regionId] = value;
    }
  });

  return {
    columns,
    rows,
    leftColumnRate,
    middleColumnRate,
    topRowRate,
    layoutName,
    placements: nextPlacements,
  };
};

const createLayoutFromStorage = (): WorksheetLayoutState => {
  if (typeof window === 'undefined') {
    return createDefaultLayout();
  }

  const raw = window.localStorage.getItem(LOCAL_LAYOUT_KEY);
  if (!raw) {
    return createDefaultLayout();
  }

  try {
    const parsed = JSON.parse(raw) as WorksheetLayoutEnvelope | WorksheetLayoutState;
    return normalizeLayoutState(parsed) ?? createDefaultLayout();
  } catch (error) {
    console.error(error);
    return createDefaultLayout();
  }
};

const getGridColumnsStyle = (count: number, first: number, second: number): string => {
  if (count <= 1) {
    return '1fr';
  }

  if (count === 2) {
    return `${first}% ${100 - first}%`;
  }

  return `${first}% ${second}% ${100 - first - second}%`;
};

const getGridRowsStyle = (count: number, first: number): string => {
  if (count <= 1) {
    return '1fr';
  }

  return `${first}% ${100 - first}%`;
};

const preservePlacementForGrid = (
  state: WorksheetLayoutState,
  nextRows: number,
  nextColumns: number,
): Record<RegionId, string | null> => {
  const orderedRegions = buildRegionIds(state.rows, state.columns);
  const currentWidgets: string[] = [];
  const seen = new Set<string>();

  for (const regionId of orderedRegions) {
    const widgetId = state.placements[regionId];
    if (!widgetId || seen.has(widgetId)) {
      continue;
    }

    seen.add(widgetId);
    currentWidgets.push(widgetId);
  }

  const nextPlacements: Record<RegionId, string | null> = {};
  const nextRegions = buildRegionIds(nextRows, nextColumns);

  nextRegions.forEach((regionId, index) => {
    nextPlacements[regionId] = currentWidgets[index] ?? null;
  });

  return nextPlacements;
};

const assignWidget = (
  state: WorksheetLayoutState,
  targetRegion: RegionId,
  widgetId: string | null,
): WorksheetLayoutState => {
  const nextPlacements = { ...state.placements };

  if (widgetId) {
    for (const [regionId, current] of Object.entries(nextPlacements)) {
      if (regionId !== targetRegion && current === widgetId) {
        nextPlacements[regionId] = null;
      }
    }
  }

  nextPlacements[targetRegion] = widgetId;

  return {
    ...state,
    placements: nextPlacements,
    layoutName: '커스텀 분할',
  };
};

export default function Worksheet() {
  const [layout, setLayout] = useState<WorksheetLayoutState>(createLayoutFromStorage);
  const [history, setHistory] = useState<WorksheetLayoutState[]>([]);
  const [notice, setNotice] = useState('');
  const [dragOverRegion, setDragOverRegion] = useState<RegionId | null>(null);
  const layoutFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(LOCAL_LAYOUT_KEY, JSON.stringify(layout));
    } catch (error) {
      console.error(error);
    }
  }, [layout]);

  const regionIds = useMemo<RegionId[]>(
    () => buildRegionIds(layout.rows, layout.columns),
    [layout.rows, layout.columns],
  );

  const selectedWidgetLabels = useMemo(
    () =>
      Object.fromEntries(
        EDIT_WIDGETS.map((widget) => [widget.id, `${widget.title} (${widget.description})`]),
      ) as Record<string, string>,
    [],
  );

  const safeLeftRate =
    layout.columns >= 2 ? clamp(layout.leftColumnRate, 10, layout.columns === 2 ? 90 : 80) : 100;
  const safeTopRate = layout.rows >= 2 ? clamp(layout.topRowRate, 10, 90) : 100;
  const safeMiddleRate =
    layout.columns >= 3
      ? clamp(layout.middleColumnRate, 10, Math.max(10, 90 - safeLeftRate - 10))
      : 0;

  const placedWidgetCount = regionIds.reduce(
    (count, regionId) => (layout.placements[regionId] ? count + 1 : count),
    0,
  );

  const getWidgetTitle = (widgetId: string) =>
    EDIT_WIDGETS.find((item) => item.id === widgetId)?.title ?? widgetId;

  const pushHistory = (prev: WorksheetLayoutState) => {
    setHistory((prevHistory) => [...prevHistory.slice(-12), cloneLayoutState(prev)]);
  };

  const applyLayoutPreset = (preset: 'single' | 'two-col' | 'two-row' | 'three-col' | 'four') => {
    setLayout((prevState) => {
      pushHistory(prevState);

      if (preset === 'single') {
        return {
          ...prevState,
          columns: 1,
          rows: 1,
          leftColumnRate: 100,
          middleColumnRate: 0,
          topRowRate: 100,
          layoutName: '단일 영역',
          placements: preservePlacementForGrid(prevState, 1, 1),
        };
      }

      if (preset === 'two-col') {
        return {
          ...prevState,
          columns: 2,
          rows: 1,
          leftColumnRate: 52,
          middleColumnRate: 0,
          topRowRate: 100,
          layoutName: '2컬럼 분할',
          placements: preservePlacementForGrid(prevState, 1, 2),
        };
      }

      if (preset === 'three-col') {
        return {
          ...prevState,
          columns: 3,
          rows: 1,
          leftColumnRate: 34,
          middleColumnRate: 33,
          topRowRate: 100,
          layoutName: '3컬럼 분할',
          placements: preservePlacementForGrid(prevState, 1, 3),
        };
      }

      if (preset === 'two-row') {
        return {
          ...prevState,
          columns: 1,
          rows: 2,
          leftColumnRate: 100,
          middleColumnRate: 0,
          topRowRate: 55,
          layoutName: '2로우 분할',
          placements: preservePlacementForGrid(prevState, 2, 1),
        };
      }

      return {
        ...prevState,
        columns: 2,
        rows: 2,
        leftColumnRate: 52,
        middleColumnRate: 28,
        topRowRate: 55,
        layoutName: '2x2 분할',
        placements: preservePlacementForGrid(prevState, 2, 2),
      };
    });
  };

  const handleLeftRateChange = (value: number) => {
    setLayout((prevState) => {
      if (prevState.leftColumnRate === value) {
        return prevState;
      }

      pushHistory(prevState);

      return {
        ...prevState,
        leftColumnRate: value,
        layoutName: '커스텀 분할',
      };
    });
  };

  const handleMiddleRateChange = (value: number) => {
    setLayout((prevState) => {
      if (prevState.middleColumnRate === value) {
        return prevState;
      }

      pushHistory(prevState);

      return {
        ...prevState,
        middleColumnRate: value,
        layoutName: '커스텀 분할',
      };
    });
  };

  const handleTopRateChange = (value: number) => {
    setLayout((prevState) => {
      if (prevState.topRowRate === value) {
        return prevState;
      }

      pushHistory(prevState);

      return {
        ...prevState,
        topRowRate: value,
        layoutName: '커스텀 분할',
      };
    });
  };

  const handlePlacement = (regionId: RegionId, value: string) => {
    const widgetId = value === '' ? null : value;
    setLayout((prevState) => {
      pushHistory(prevState);
      return assignWidget(prevState, regionId, widgetId);
    });
  };

  const handleAddWidgetToFirstEmpty = (widget: WidgetDef) => {
    setLayout((prevState) => {
      const nextRegionIds = buildRegionIds(prevState.rows, prevState.columns);
      const firstEmpty = nextRegionIds.find((regionId) => !prevState.placements[regionId]);

      if (!firstEmpty) {
        setNotice('빈 영역이 없어 추가하지 못했습니다.');
        return prevState;
      }

      pushHistory(prevState);
      const next = assignWidget(prevState, firstEmpty, widget.id);
      setNotice(`${widget.title} 위젯을 ${firstEmpty} 영역에 배치했습니다.`);
      return next;
    });
  };

  const clearPlacements = () => {
    setLayout((prevState) => {
      pushHistory(prevState);
      return {
        ...prevState,
        layoutName: '커스텀 분할',
        placements: createEmptyLayout(prevState.rows, prevState.columns),
      };
    });
  };

  const resetLayout = () => {
    setLayout((prevState) => {
      pushHistory(prevState);
      return createDefaultLayout();
    });
  };

  const handleUndo = () => {
    let restored = false;

    setHistory((prevHistory) => {
      if (prevHistory.length === 0) {
        return prevHistory;
      }

      const nextState = prevHistory[prevHistory.length - 1];
      setLayout(cloneLayoutState(nextState));
      restored = true;
      return prevHistory.slice(0, -1);
    });

    if (restored) {
      setNotice('한 단계 되돌리기 했습니다.');
    }
  };

  const handleSave = () => {
    setNotice(
      `현재 레이아웃을 저장했습니다. (영역 ${layout.rows * layout.columns}개, 배치 ${placedWidgetCount}개)`,
    );
  };

  const exportLayoutPayload = (state: WorksheetLayoutState) => ({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    layout: state,
  });

  const handleExportLayout = () => {
    try {
      const payload = exportLayoutPayload(layout);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replaceAll(':', '-').split('.')[0];

      link.href = url;
      link.download = `faddit-worksheet-${timestamp}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setNotice('레이아웃 JSON을 다운로드했습니다.');
    } catch (error) {
      console.error(error);
      setNotice('내보내기에 실패했습니다.');
    }
  };

  const handleCopyLayout = async () => {
    const payload = JSON.stringify(exportLayoutPayload(layout), null, 2);

    try {
      await navigator.clipboard.writeText(payload);
      setNotice('레이아웃 JSON을 클립보드에 복사했습니다.');
    } catch (error) {
      console.error(error);
      setNotice('클립보드 복사에 실패했습니다.');
    }
  };

  const handleImportClick = () => {
    layoutFileInputRef.current?.click();
  };

  const handleImportLayout = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorksheetLayoutEnvelope | WorksheetLayoutState;
      const imported = normalizeLayoutState(parsed);

      if (!imported) {
        setNotice('가져오기할 수 없는 레이아웃 파일입니다.');
        return;
      }

      setHistory((prevHistory) => [...prevHistory.slice(-12), cloneLayoutState(layout)]);
      setLayout(imported);
      setNotice('파일에서 레이아웃을 불러왔습니다.');
    } catch (error) {
      console.error(error);
      setNotice('레이아웃 파일 파싱에 실패했습니다.');
    }
  };

  const parseDragPayload = (event: DragEvent<HTMLElement>): WorksheetDragPayload | null => {
    const payload = event.dataTransfer.getData('application/json');

    if (!payload) {
      return null;
    }

    try {
      const parsed = JSON.parse(payload) as unknown;
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'source' in parsed &&
        'widgetId' in parsed &&
        typeof (parsed as { source: unknown; widgetId: unknown }).widgetId === 'string'
      ) {
        if ((parsed as { source: string }).source === 'library') {
          return {
            source: 'library',
            widgetId: (parsed as { widgetId: string }).widgetId,
          };
        }

        if (
          (parsed as { source: string; sourceRegionId: unknown }).source === 'region' &&
          typeof (parsed as { sourceRegionId: unknown }).sourceRegionId === 'string'
        ) {
          return {
            source: 'region',
            widgetId: (parsed as { widgetId: string }).widgetId,
            sourceRegionId: (parsed as { sourceRegionId: string }).sourceRegionId,
          };
        }
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  };

  const handleLibraryDragStart = (widget: WidgetDef, event: DragEvent<HTMLButtonElement>) => {
    const payload: WorksheetDragPayload = {
      source: 'library',
      widgetId: widget.id,
    };

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleRegionDragStart = (
    regionId: RegionId,
    widgetId: string,
    event: DragEvent<HTMLDivElement>,
  ) => {
    const payload: WorksheetDragPayload = {
      source: 'region',
      widgetId,
      sourceRegionId: regionId,
    };

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleRegionDragOver = (regionId: RegionId, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const payload = parseDragPayload(event);

    if (payload?.source === 'library') {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }

    setDragOverRegion(regionId);
  };

  const handleRegionDragLeave = (regionId: RegionId, event: DragEvent<HTMLDivElement>) => {
    const isLeavingContainer = event.currentTarget.contains(event.relatedTarget as Node | null);

    if (isLeavingContainer) {
      return;
    }

    setDragOverRegion((current) => (current === regionId ? null : current));
  };

  const handleRegionDrop = (regionId: RegionId, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOverRegion(null);

    const payload = parseDragPayload(event);
    if (!payload) {
      return;
    }

    if (payload.source === 'region' && payload.sourceRegionId === regionId) {
      return;
    }

    setLayout((prevState) => {
      if (payload.source === 'library') {
        if (prevState.placements[regionId] === payload.widgetId) {
          return prevState;
        }

        pushHistory(prevState);
        setNotice(`${getWidgetTitle(payload.widgetId)} 위젯을 ${regionId} 영역에 배치했습니다.`);
        return assignWidget(prevState, regionId, payload.widgetId);
      }

      const sourceWidget = prevState.placements[payload.sourceRegionId];
      if (sourceWidget !== payload.widgetId) {
        return prevState;
      }

      if (prevState.placements[regionId] === payload.widgetId) {
        return prevState;
      }

      const nextPlacements = {
        ...prevState.placements,
        [payload.sourceRegionId]: null,
      };

      pushHistory(prevState);
      setNotice(
        `${getWidgetTitle(payload.widgetId)} 위젯을 ${payload.sourceRegionId} 영역에서 ${regionId} 영역으로 이동했습니다.`,
      );

      return assignWidget(
        {
          ...prevState,
          placements: nextPlacements,
        },
        regionId,
        payload.widgetId,
      );
    });
  };

  return (
    <div className='flex h-screen w-screen flex-col bg-[#edf2f7] p-3 text-[13px] text-gray-700'>
      <header className='mb-3 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='grid h-9 w-9 place-items-center rounded-lg bg-black text-white'>
            <LayoutGrid size={18} />
          </div>
          <div>
            <p className='text-sm font-semibold text-gray-900'>워크시트 레이아웃 예제</p>
            <p className='text-xs text-gray-500'>화면 분할과 배치 구성을 미리보기로 구성해보세요</p>
          </div>
          <span className='ml-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500'>
            {layout.layoutName}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleSave}
            className='inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-2 text-white transition-opacity hover:opacity-90'
          >
            <Save size={16} />
            저장
          </button>
          <button
            type='button'
            onClick={resetLayout}
            className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-50'
          >
            <RefreshCw size={16} />
            초기화
          </button>
          <Link
            to='/faddit/worksheet?viewmode=edit'
            className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-gray-50'
          >
            편집 모드로 보기
          </Link>
        </div>
      </header>

      <div className='mb-2 text-xs text-gray-500'>
        {notice || '변경 사항은 좌측 배치/오른쪽 속성 패널에서 즉시 확인할 수 있습니다.'}
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_280px] gap-3'>
        <aside className='overflow-hidden rounded-xl bg-white p-3 shadow-sm'>
          <p className='mb-3 text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase'>
            위젯 라이브러리
          </p>
          <div className='flex flex-col gap-2'>
            {EDIT_WIDGETS.map((widget) => (
              <button
                key={widget.id}
                type='button'
                className='w-full rounded-lg border border-gray-200 bg-white p-2 text-left transition-colors hover:border-gray-900'
                draggable
                onDragStart={(event) => handleLibraryDragStart(widget, event)}
                onClick={() => handleAddWidgetToFirstEmpty(widget)}
              >
                <p className='text-sm font-medium text-gray-800'>{widget.title}</p>
                <p className='mt-0.5 text-xs text-gray-500'>{widget.description}</p>
              </button>
            ))}
          </div>

          <div className='mt-4 border-t border-gray-100 pt-4'>
            <p className='mb-2 text-xs font-semibold tracking-[0.12em] text-gray-400 uppercase'>
              배치 관리
            </p>
            <div className='grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={clearPlacements}
                className='rounded-lg border border-gray-200 px-2 py-1.5 transition-colors hover:bg-gray-50'
              >
                전체 비우기
              </button>
              <button
                type='button'
                onClick={handleUndo}
                className='rounded-lg border border-gray-200 px-2 py-1.5 transition-colors hover:bg-gray-50'
              >
                Undo
              </button>
            </div>
          </div>
        </aside>

        <section className='min-w-0 rounded-xl bg-white p-3 shadow-sm'>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                className='rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50'
                onClick={() => applyLayoutPreset('single')}
              >
                단일
              </button>
              <button
                type='button'
                className='rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50'
                onClick={() => applyLayoutPreset('two-col')}
              >
                2컬럼
              </button>
              <button
                type='button'
                className='rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50'
                onClick={() => applyLayoutPreset('three-col')}
              >
                3컬럼
              </button>
              <button
                type='button'
                className='rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50'
                onClick={() => applyLayoutPreset('two-row')}
              >
                2로우
              </button>
              <button
                type='button'
                className='rounded-md border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-50'
                onClick={() => applyLayoutPreset('four')}
              >
                2x2
              </button>
            </div>
            <div className='inline-flex items-center gap-2 text-xs text-gray-500'>
              <Split size={14} />
              분할: {layout.columns}열 {layout.rows}행
            </div>
          </div>

          <div className='mb-3 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-2 py-2'>
            <div className='flex flex-1 flex-col'>
              <label htmlFor='col-size' className='text-[11px] font-medium text-gray-500'>
                가로 분할
              </label>
              <input
                id='col-size'
                type='range'
                min={10}
                max={layout.columns === 2 ? 90 : 80}
                value={safeLeftRate}
                onChange={(event) => handleLeftRateChange(Number(event.target.value))}
                disabled={layout.columns === 1}
                className='w-full'
              />
            </div>

            {layout.columns === 3 && (
              <div className='flex flex-1 flex-col'>
                <label htmlFor='col-size-2' className='text-[11px] font-medium text-gray-500'>
                  가운데 컬럼
                </label>
                <input
                  id='col-size-2'
                  type='range'
                  min={10}
                  max={Math.max(10, 90 - safeLeftRate - 10)}
                  value={safeMiddleRate}
                  onChange={(event) => handleMiddleRateChange(Number(event.target.value))}
                  className='w-full'
                />
              </div>
            )}

            <div className='flex flex-1 flex-col'>
              <label htmlFor='row-size' className='text-[11px] font-medium text-gray-500'>
                세로 분할
              </label>
              <input
                id='row-size'
                type='range'
                min={10}
                max={90}
                value={safeTopRate}
                onChange={(event) => handleTopRateChange(Number(event.target.value))}
                disabled={layout.rows === 1}
                className='w-full'
              />
            </div>
          </div>

          <div
            className='grid h-[calc(100%-112px)] min-h-0 gap-3 rounded-lg border border-gray-100 p-3'
            style={{
              gridTemplateColumns: getGridColumnsStyle(
                layout.columns,
                safeLeftRate,
                safeMiddleRate,
              ),
              gridTemplateRows: getGridRowsStyle(layout.rows, safeTopRate),
            }}
          >
            {regionIds.map((regionId, index) => {
              const [row, col] = regionId.split('-').map((value) => Number.parseInt(value, 10));
              const widgetId = layout.placements[regionId];
              const widget = EDIT_WIDGETS.find((candidate) => candidate.id === widgetId);

              return (
                <div
                  key={regionId}
                  className={`relative min-h-0 rounded-lg border border-dashed bg-gray-50 p-2 ${
                    dragOverRegion === regionId ? 'border-gray-900 bg-gray-100' : 'border-gray-300'
                  }`}
                  draggable={Boolean(widgetId)}
                  onDragStart={(event) => {
                    if (widgetId) {
                      handleRegionDragStart(regionId, widgetId, event);
                    }
                  }}
                  onDragOver={(event) => handleRegionDragOver(regionId, event)}
                  onDragLeave={(event) => handleRegionDragLeave(regionId, event)}
                  onDrop={(event) => handleRegionDrop(regionId, event)}
                >
                  <p className='mb-2 flex items-center gap-1 text-[11px] font-semibold text-gray-400'>
                    <Table2 size={12} />
                    영역 {row + 1}-{col + 1} ({index + 1})
                  </p>

                  {widget ? (
                    <div className={`h-full rounded-lg bg-gradient-to-br ${widget.styleClass} p-3`}>
                      <p className='text-sm font-semibold text-gray-900'>{widget.title}</p>
                      <p className='mt-1 text-xs text-gray-600'>{widget.description}</p>
                    </div>
                  ) : (
                    <div className='flex h-full min-h-0 flex-col items-center justify-center text-center text-gray-400'>
                      <Type size={20} />
                      <p className='mt-1 text-xs'>빈 영역입니다</p>
                      <p className='text-[11px]'>왼쪽 위젯을 추가해보세요</p>
                    </div>
                  )}

                  <div className='absolute top-2 right-2'>
                    <select
                      value={widgetId ?? ''}
                      onChange={(event) => handlePlacement(regionId, event.target.value)}
                      className='rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none'
                    >
                      <option value=''>비우기</option>
                      {EDIT_WIDGETS.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {widget && (
                    <div className='absolute bottom-2 left-2 text-[11px] text-gray-500'>
                      {selectedWidgetLabels[widget.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className='overflow-hidden rounded-xl bg-white p-3 shadow-sm'>
          <div className='mb-3'>
            <p className='text-sm font-semibold text-gray-900'>속성 패널</p>
            <p className='text-xs text-gray-500'>선택한 영역에 맞춰 배치 상태를 확인하세요.</p>
          </div>

          <div className='space-y-3'>
            <div className='rounded-lg border border-gray-200 p-3'>
              <p className='mb-2 text-xs font-semibold text-gray-500'>현재 레이아웃</p>
              <div className='text-sm text-gray-700'>
                <p>
                  총 영역: <span className='font-semibold'>{layout.rows * layout.columns}개</span>
                </p>
                <p>
                  배치된 위젯: <span className='font-semibold'>{placedWidgetCount}개</span>
                </p>
                <p>
                  미배치 슬롯:{' '}
                  <span className='font-semibold'>
                    {layout.rows * layout.columns - placedWidgetCount}개
                  </span>
                </p>
              </div>
            </div>

            <div className='rounded-lg border border-gray-200 p-3'>
              <p className='mb-2 text-xs font-semibold text-gray-500'>빠른 액션</p>
              <div className='grid gap-2'>
                <button
                  type='button'
                  onClick={handleExportLayout}
                  className='flex items-center justify-center gap-1 rounded-md bg-black px-3 py-2 text-sm text-white'
                >
                  <ArrowDownToLine size={15} />
                  레이아웃 내보내기
                </button>
                <button
                  type='button'
                  onClick={handleCopyLayout}
                  className='rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700'
                >
                  <span className='mr-1 inline-flex align-middle'>
                    <Copy size={15} />
                  </span>
                  전체 복사
                </button>
                <button
                  type='button'
                  onClick={handleImportClick}
                  className='rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700'
                >
                  파일 가져오기
                </button>
              </div>
              <input
                ref={layoutFileInputRef}
                type='file'
                accept='application/json,.json'
                className='hidden'
                onChange={handleImportLayout}
              />
            </div>

            <div className='rounded-lg border border-gray-200 p-3'>
              <p className='mb-2 text-xs font-semibold text-gray-500'>배치 이력</p>
              <p className='text-xs text-gray-600'>
                예시 화면입니다. 실제 작업 저장 시 DB 연동/템플릿 API 연결을 추가하면 바로 배포
                가능한 형태로 확장 가능합니다.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
