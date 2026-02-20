import { useState } from 'react';

import WorksheetTopBar from './WorksheetTopBar';
import WorksheetLeftSidebar from './WorksheetLeftSidebar';
import WorksheetContentPanel from './WorksheetContentPanel';
import WorksheetToolbox from './WorksheetToolbox';
import { CanvasProvider } from './CanvasProvider';

export default function WorksheetEditMode() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <CanvasProvider>
      <div className='flex h-screen min-h-0 flex-col bg-[#f4f5f7] p-3 text-gray-800'>
        <div className='mb-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700'>
          현재 모드: 편집 모드
        </div>
        <WorksheetTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          isEditMode
        />

        <div className='mt-3 flex min-h-0 flex-1 gap-3'>
          <WorksheetLeftSidebar open={sidebarOpen} />
          <WorksheetContentPanel />
          <WorksheetToolbox />
        </div>
      </div>
    </CanvasProvider>
  );
}
