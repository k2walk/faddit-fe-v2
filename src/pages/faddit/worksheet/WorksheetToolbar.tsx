import React, { useState } from 'react';
import {
  ArrowRight,
  Box,
  ChevronsLeft,
  ChevronsRight,
  CloudUpload,
  Layers,
  LayoutGrid,
  Settings,
  Type,
} from 'lucide-react';

const CONTENT_PANEL_WIDTH = 224;
const GAP_X = 12;

const TOOL_ITEMS = [
  { key: 'template', label: '템플릿', icon: LayoutGrid },
  { key: 'element', label: '요소', icon: Box },
  { key: 'upload', label: '업로드', icon: CloudUpload },
  { key: 'text', label: '텍스트', icon: Type },
  { key: 'tools', label: '도구', icon: Settings },
  { key: 'layer', label: '레이어', icon: Layers },
];

const RECOMMENDED_SECTIONS_COUNT = 3;
const PLACEHOLDERS_PER_SECTION = 4;

export default function WorksheetToolbar() {
  const [activeTool, setActiveTool] = useState('template');
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <div className='flex h-full shrink-0 overflow-hidden rounded-lg bg-white p-3 shadow-sm'>
      <div className='flex min-h-0 min-w-0 flex-1'>
        <nav className='flex w-14 shrink-0 flex-col gap-y-2'>
          {TOOL_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type='button'
              onClick={() => setActiveTool(key)}
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md p-2 text-[10px] transition-colors ${
                activeTool === key
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-200/60'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              {label}
            </button>
          ))}
          <div className='mt-auto flex justify-center py-2'>
            <button
              type='button'
              onClick={() => setContentOpen((open) => !open)}
              className='cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              aria-label={contentOpen ? '도구모음 접기' : '도구모음 펼치기'}
            >
              {contentOpen ? (
                <ChevronsLeft size={18} strokeWidth={1.5} />
              ) : (
                <ChevronsRight size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </nav>

        <div
          className='flex shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-in-out'
          style={{ width: contentOpen ? CONTENT_PANEL_WIDTH + GAP_X : 0 }}
        >
          <div
            className='flex min-h-0 min-w-56 flex-1 flex-col gap-y-2 pl-3 transition-opacity duration-300 ease-in-out'
            style={{ opacity: contentOpen ? 1 : 0 }}
          >
            <div className='shrink-0 border-b border-gray-100'>
              <div className='relative flex items-center gap-1 rounded-lg border border-gray-200 bg-white'>
                <textarea
                  placeholder='템플릿 검색 (예: 카라가 있는 티셔츠)'
                  className='form-input min-w-0 flex-1 resize-none rounded-l-lg border-0 px-2 py-1 pb-9 text-sm text-[13px] outline-none focus:ring-0'
                />
                <button
                  type='button'
                  className='absolute right-2 bottom-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700'
                  aria-label='검색'
                >
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className='flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto'>
              {Array.from({ length: RECOMMENDED_SECTIONS_COUNT }).map((_, sectionIndex) => (
                <div key={sectionIndex} className='flex flex-col gap-y-2'>
                  <p className='text-xs font-semibold text-gray-700'>추천 템플릿</p>
                  <div className='grid grid-cols-2 gap-2'>
                    {Array.from({ length: PLACEHOLDERS_PER_SECTION }).map((_, i) => (
                      <div key={i} className='aspect-square rounded-lg bg-gray-100' />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
