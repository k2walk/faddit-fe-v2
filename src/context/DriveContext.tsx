import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a Drive Item
export interface DriveItem {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  badge: string;
}

export interface SidebarItem {
  id: string;
  type: 'folder' | 'file';
  name: string;
  children?: SidebarItem[];
  isOpen?: boolean; // For folders
}

interface DriveContextType {
  items: DriveItem[];
  setItems: React.Dispatch<React.SetStateAction<DriveItem[]>>;
  moveItemToFolder: (itemId: string, folderId: string) => void;
  activeDragItem: DriveItem | null;
  setActiveDragItem: (item: DriveItem | null) => void;
  workspaces: SidebarItem[];
  setWorkspaces: React.Dispatch<React.SetStateAction<SidebarItem[]>>;
  favorites: SidebarItem[];
  setFavorites: React.Dispatch<React.SetStateAction<SidebarItem[]>>;
  addFileToSection: (section: 'workspace' | 'favorite', file: SidebarItem) => void;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export const useDrive = () => {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
};

// Initial Mock Data
const initialWorkspaces: SidebarItem[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `folder-workspace-${i}`,
  type: 'folder',
  name: `워크 스페이스 폴더 ${i + 1}`,
  children: [{ id: `file-workspace-${i}-1`, type: 'file', name: '작지 파일 1' }],
}));

const initialFavorites: SidebarItem[] = Array.from({ length: 3 }).map((_, i) => ({
  id: `folder-favorite-${i}`,
  type: 'folder',
  name: `좋아하는 폴더 ${i + 1}`,
  children: [{ id: `file-favorite-${i}-1`, type: 'file', name: '작지 파일 1' }],
}));

export const DriveProvider = ({
  children,
  initialItems,
}: {
  children: ReactNode;
  initialItems?: DriveItem[];
}) => {
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [activeDragItem, setActiveDragItem] = useState<DriveItem | null>(null);
  const [workspaces, setWorkspaces] = useState<SidebarItem[]>(initialWorkspaces);
  const [favorites, setFavorites] = useState<SidebarItem[]>(initialFavorites);

  const moveItemToFolder = (itemId: string, folderId: string) => {
    console.log(`Moving item ${itemId} to folder ${folderId}`);
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const addFileToSection = (section: 'workspace' | 'favorite', file: SidebarItem) => {
    if (section === 'workspace') {
      setWorkspaces((prev) => [...prev, file]);
    } else {
      setFavorites((prev) => [...prev, file]);
    }
  };

  return (
    <DriveContext.Provider
      value={{
        items,
        setItems,
        moveItemToFolder,
        activeDragItem,
        setActiveDragItem,
        workspaces,
        setWorkspaces,
        favorites,
        setFavorites,
        addFileToSection,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
};
