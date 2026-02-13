import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import Drivebar from '../partials/Drivebar';
import Header from '../partials/Header';
import { DriveProvider, useDrive, DriveItem } from '../context/DriveContext';
import DriveItemCard from '../components/DriveItemCard';

// Inner component to use the context
const DriveLayoutContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    activeDragItem,
    setActiveDragItem,
    moveItemToFolder,
    moveSidebarItem,
    items,
    setItems,
    addFileToSection,
  } = useDrive();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeType = active.data.current?.type;
    if (activeType !== 'drive-item') {
      setActiveDragItem(null);
      return;
    }

    const item = items.find((i) => i.id === active.id);
    if (item) {
      setActiveDragItem(item);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Logic to open folders on hover will be handled in Drivebar (or SidebarLinkGroup)
    // by monitoring drag position or using useDndMonitor, but simpler to just let
    // droppable zones handle their own 'over' state if possible.
    // However, for Auto-expanding, we might need to know which folder we are over.
    const { over } = event;
    // console.log('Dragging over:', over?.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    if (over && active.id !== over.id && activeType === 'sidebar-item') {
      moveSidebarItem(active.id.toString(), over.id.toString());
      setActiveDragItem(null);
      return;
    }

    if (over && active.id !== over.id && activeType === 'drive-item') {
      const activeItem = items.find((i) => i.id === active.id);

      if (over.id === 'section-workspace' && activeItem) {
        // Drop on Workspace Section
        addFileToSection('workspace', {
          id: activeItem.id,
          type: 'file',
          name: activeItem.title,
        });
        // Remove from main list
        setItems((prev) => prev.filter((i) => i.id !== active.id));
      } else if (over.id === 'section-favorite' && activeItem) {
        // Drop on Favorites Section
        addFileToSection('favorite', {
          id: activeItem.id,
          type: 'file',
          name: activeItem.title,
        });
        // Remove from main list
        setItems((prev) => prev.filter((i) => i.id !== active.id));
      } else {
        // Drop on a folder (existing logic)
        moveItemToFolder(active.id.toString(), over.id.toString());
      }
    }

    setActiveDragItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className='flex h-[100dvh] overflow-hidden'>
        <Drivebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className='relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto'>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <main className='grow'>
            <Outlet />
          </main>
        </div>
      </div>
      <DragOverlay>
        {activeDragItem ? (
          <div className='pointer-events-none w-[200px] rounded-xl border-2 border-violet-500 bg-white opacity-90 shadow-2xl dark:bg-gray-800'>
            <div className='flex items-center p-2'>
              <div className='h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-200'>
                <img
                  src={activeDragItem.imageSrc}
                  alt={activeDragItem.imageAlt}
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='ml-3 overflow-hidden'>
                <h3 className='truncate text-sm font-semibold text-gray-800 dark:text-gray-100'>
                  {activeDragItem.title}
                </h3>
                <p className='truncate text-xs text-gray-500'>{activeDragItem.subtitle}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const DriveLayout: React.FC = () => {
  return (
    <DriveProvider>
      <DriveLayoutContent />
    </DriveProvider>
  );
};

export default DriveLayout;
