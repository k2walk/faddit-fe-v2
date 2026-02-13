import React, { useState } from 'react';
import ToggleButton from '../../../components/atoms/ToggleButton';

const PAGE_THUMB_WIDTH = 120;
const PAGE_THUMB_HEIGHT = 80;

const PAGES = [
  { id: 1, label: '도식화' },
  { id: 2, label: '패턴' },
];

export default function WorksheetCanvasSection() {
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [pageToggle, setPageToggle] = useState(true);
  const [zoom, setZoom] = useState(100);

  return (
    <section className='flex h-full min-w-0 flex-1 flex-col gap-2'>
      <div className='min-h-0 flex-1 rounded-md bg-white' />

      <div className='flex shrink-0 flex-col rounded-md bg-white px-4 py-3'>
        <div
          className='overflow-hidden transition-[max-height,margin] duration-300 ease-in-out'
          style={{
            maxHeight: pageToggle ? PAGE_THUMB_HEIGHT : 0,
            marginBottom: pageToggle ? 8 : 0,
          }}
        >
          <div
            className='flex items-center gap-2 transition-opacity duration-300 ease-in-out'
            style={{ opacity: pageToggle ? 1 : 0 }}
          >
            {PAGES.map((page) => (
              <button
                key={page.id}
                type='button'
                onClick={() => setSelectedPageId(page.id)}
                className={`relative flex shrink-0 cursor-pointer flex-col rounded-lg bg-white transition-colors ${
                  selectedPageId === page.id
                    ? 'border-2 border-gray-700'
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
                style={{ width: PAGE_THUMB_WIDTH, height: PAGE_THUMB_HEIGHT }}
              >
                <span className='absolute right-1.5 top-1 text-[10px] text-gray-500'>
                  {page.id}
                </span>
                <span className='mt-auto pb-1.5 pl-1.5 text-left text-xs text-gray-700'>
                  {page.label}
                </span>
              </button>
            ))}
            <button
              type='button'
              className='flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600'
              aria-label='페이지 추가'
              style={{ width: PAGE_THUMB_WIDTH, height: PAGE_THUMB_HEIGHT }}
            >
              <span className='text-2xl leading-none'>+</span>
            </button>
          </div>
        </div>
        <div className='flex w-full items-center justify-end gap-3'>
          <ToggleButton
            label='페이지'
            checked={pageToggle}
            onChange={() => setPageToggle((v) => !v)}
          />
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => setZoom((z) => Math.max(10, z - 10))}
              className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-all duration-300 hover:bg-gray-100'
            >
              −
            </button>
            <span className='min-w-[3.5rem] text-center text-sm text-gray-800'>{zoom} %</span>
            <button
              type='button'
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-all duration-300 hover:bg-gray-100'
            >
              +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
