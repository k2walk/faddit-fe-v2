import React, { useEffect, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import DriveItemCard from '../../../components/DriveItemCard';
import Toast2 from '../../../components/Toast2';
import ChildCloth from '../../../images/faddit/childcloth.png';
import { useDrive } from '../../../context/DriveContext';

type ViewMode = 'grid' | 'list';

const DriveListRow: React.FC<{
  item: {
    id: string;
    title: string;
    subtitle: string;
    owner?: string;
    date?: string;
    size?: string;
  };
  checked: boolean;
  onCheckChange: (checked: boolean) => void;
}> = ({ item, checked, onCheckChange }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: 'drive-item',
      title: item.title,
      subtitle: item.subtitle,
    },
  });

  const style = isDragging
    ? {
        opacity: 0,
      }
    : transform
      ? {
          transform: CSS.Translate.toString(transform),
        }
      : undefined;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='cursor-grab border-t border-gray-100 active:cursor-grabbing dark:border-gray-700/60'
    >
      <td className='w-px px-4 py-3'>
        <label className='inline-flex' onPointerDown={(e) => e.stopPropagation()}>
          <span className='sr-only'>Select {item.title}</span>
          <input
            className='form-checkbox'
            type='checkbox'
            checked={checked}
            onChange={(e) => onCheckChange(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </label>
      </td>
      <td className='px-4 py-3'>
        <div className='font-medium text-gray-800 dark:text-gray-100'>{item.title}</div>
        <div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>{item.subtitle}</div>
      </td>
      <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{item.owner || '-'}</td>
      <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{item.date || '-'}</td>
      <td className='px-4 py-3 text-gray-600 dark:text-gray-300'>{item.size || '-'}</td>
    </tr>
  );
};

const FadditDrive: React.FC = () => {
  const { items, setItems } = useDrive();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteToastOpen, setDeleteToastOpen] = useState(false);
  const [deletedSnapshot, setDeletedSnapshot] = useState<typeof items>([]);
  const [deletedMessage, setDeletedMessage] = useState('');

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    if (items.length === 0) {
      const mockItems = Array.from({ length: 10 }).map((_, index) => ({
        id: `drive-item-${index + 1}`,
        imageSrc: ChildCloth,
        imageAlt: 'Application 01',
        title: `[패딧] 2025 S/S 남성 청바지_데미지 ${index + 1}`,
        subtitle: '테스트 필드',
        badge: '테스트 뱃지1',
        owner: index % 2 === 0 ? 'Carolyn McNeail' : 'Faddit Team',
        date: `2026-02-${String((index % 9) + 1).padStart(2, '0')}`,
        size: `${(index % 5) + 1}.${index % 3} MB`,
      }));
      setItems(mockItems);
    }
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  useEffect(() => {
    if (!deleteToastOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDeleteToastOpen(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [deleteToastOpen]);

  const handleSelectItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((itemId) => itemId !== id);
    });
  };

  const handleSelectAllInList = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id));
      return;
    }
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const deletingItems = items.filter((item) => selectedSet.has(item.id));
    if (deletingItems.length === 1) {
      setDeletedMessage(`${deletingItems[0].title}(이) 삭제되었습니다`);
    } else {
      setDeletedMessage(`${deletingItems.length}개 파일이 삭제되었습니다`);
    }

    setDeletedSnapshot(items);
    setItems((prev) => prev.filter((item) => !selectedSet.has(item.id)));
    setSelectedIds([]);
    setDeleteToastOpen(true);
  };

  const handleUndoDelete = () => {
    setItems(deletedSnapshot);
    setDeleteToastOpen(false);
  };

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <div className='mx-auto w-full max-w-[99vw] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8 sm:flex sm:items-center sm:justify-between'>
        <div className='mb-4 sm:mb-0'>
          <h1 className='text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100'>홈</h1>
        </div>

        <div className='grid grid-flow-col justify-start gap-2 sm:auto-cols-max sm:justify-end'>
          <div className='flex flex-wrap -space-x-px'>
            <button
              type='button'
              onClick={() => setViewMode('list')}
              className={`btn rounded-none border-gray-200 first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 ${
                viewMode === 'list'
                  ? 'bg-white text-violet-500 dark:bg-gray-800'
                  : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900'
              }`}
              aria-label='List view'
            >
              <svg className='h-4 w-4 fill-current' viewBox='0 0 16 16'>
                <path d='M2 2h12v2H2V2Zm0 5h12v2H2V7Zm0 5h12v2H2v-2Z' />
              </svg>
            </button>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`btn rounded-none border-gray-200 first:rounded-l-lg last:rounded-r-lg dark:border-gray-700/60 ${
                viewMode === 'grid'
                  ? 'bg-white text-violet-500 dark:bg-gray-800'
                  : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-900'
              }`}
              aria-label='Grid view'
            >
              <svg className='h-4 w-4 fill-current' viewBox='0 0 16 16'>
                <path d='M1 1h6v6H1V1Zm8 0h6v6H9V1ZM1 9h6v6H1V9Zm8 0h6v6H9V9Z' />
              </svg>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              type='button'
              onClick={handleBulkDelete}
              className='btn border-gray-200 bg-white text-red-500 hover:border-gray-300 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600'
            >
              <svg className='h-4 w-4 shrink-0 fill-current' viewBox='0 0 16 16'>
                <path d='M5 7h2v6H5V7Zm4 0h2v6H9V7Zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1ZM6 2v1h4V2H6Zm7 3H3v9h10V5Z' />
              </svg>
              <span className='max-xs:sr-only ml-2'>삭제</span>
            </button>
          )}

          <button
            type='button'
            className='btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white'
          >
            <svg
              className='xs:hidden shrink-0 fill-current'
              width='16'
              height='16'
              viewBox='0 0 16 16'
            >
              <path d='M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z' />
            </svg>
            <span className='max-xs:sr-only'>Add View</span>
          </button>
        </div>
      </div>

      <div className='mt-8'>
        {viewMode === 'grid' ? (
          <div className='grid grid-cols-12 gap-6 2xl:grid-cols-5'>
            {items.map((item) => (
              <DriveItemCard
                key={item.id}
                id={item.id}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                title={item.title}
                subtitle={item.subtitle}
                badge={item.badge}
                actionLabel='View'
                actionHref='#0'
                isSelected={selectedSet.has(item.id)}
                onSelectChange={handleSelectItem}
                className='col-span-full sm:col-span-6 xl:col-span-3 2xl:col-span-1'
              />
            ))}
          </div>
        ) : (
          <div className='overflow-x-auto rounded-xl bg-white shadow-xs dark:bg-gray-800'>
            <table className='w-full table-auto text-sm dark:text-gray-300'>
              <thead className='bg-gray-50 text-xs font-semibold text-gray-500 dark:bg-gray-900/20 dark:text-gray-400'>
                <tr>
                  <th className='w-px px-4 py-3'>
                    <label className='inline-flex'>
                      <span className='sr-only'>Select all</span>
                      <input
                        className='form-checkbox'
                        type='checkbox'
                        checked={allSelected}
                        onChange={(e) => handleSelectAllInList(e.target.checked)}
                      />
                    </label>
                  </th>
                  <th className='px-4 py-3 text-left'>Name</th>
                  <th className='px-4 py-3 text-left'>Owner</th>
                  <th className='px-4 py-3 text-left'>Date</th>
                  <th className='px-4 py-3 text-left'>Size</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <DriveListRow
                    key={item.id}
                    item={item}
                    checked={selectedSet.has(item.id)}
                    onCheckChange={(checked) => handleSelectItem(item.id, checked)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast2
        type='info'
        open={deleteToastOpen}
        setOpen={setDeleteToastOpen}
        className='fixed right-4 bottom-4 z-50'
      >
        <div className='flex min-w-[360px] items-center justify-between gap-5 py-1 text-base text-gray-700 dark:text-gray-200'>
          <span className='font-bold'>{deletedMessage}</span>
          <button
            type='button'
            onClick={handleUndoDelete}
            className='shrink-0 text-sm font-bold text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300'
          >
            실행취소
          </button>
        </div>
      </Toast2>
    </div>
  );
};

export default FadditDrive;
