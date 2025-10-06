import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { MediaItem, MediaType, Playlist, LibraryViewMode } from '../types';
import { generateStableId, isAudio, isVideo, isMedia, idb } from '../utils';
import FolderIcon from './icons/FolderIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import FileGenericIcon from './icons/FileGenericIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import ViewModeToggle from './ViewModeToggle';
import { LIKED_SONGS_PLAYLIST_ID } from '../constants';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import MediaItemMenu from './MediaItemMenu';
import FolderListItem from './FolderListItem';
import LibraryListItem from './LibraryListItem';
import FolderCard from './FolderCard';
import LibraryCard from './LibraryCard';
import SelectionCheckbox from './SelectionCheckbox';
import CheckCircleIcon from './icons/CheckCircleIcon';

declare const jsmediatags: any;

interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    move(newName: string): Promise<void>;
}

interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
    queryPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    requestPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
    move(newName: string): Promise<void>;
}

type FileSystemHandle = FileSystemFileHandle | FileSystemDirectoryHandle;

interface WindowWithPicker extends Window {
    showDirectoryPicker(options?: { mode: 'read' | 'readwrite'}): Promise<FileSystemDirectoryHandle>;
}

interface BrowseProps {
  onLibraryScanned: (newFiles: MediaItem[]) => void;
  onSelectMedia: (media: MediaItem, queueContext: MediaItem[]) => void;
  onAddToQueue: (item: MediaItem) => void;
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  playlists: Playlist[];
  requestConfirmation: (title: string, message: string, onConfirm: () => void) => void;
}

interface DirectoryTree {
  [name: string]: DirectoryTree | File;
}

const parseFilesMapToTree = (filesMap: Map<string, File>): DirectoryTree => {
    const tree: DirectoryTree = {};
    for (const [path, file] of filesMap.entries()) {
        const parts = path.split('/');
        let currentLevel: DirectoryTree = tree;
        let conflict = false;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!currentLevel[part]) {
                currentLevel[part] = {};
            }
            const nextLevel = currentLevel[part];
            if (nextLevel instanceof File) {
                console.warn(`Path conflict for "${path}". An item is both a file and directory.`);
                conflict = true;
                break;
            }
            currentLevel = nextLevel as DirectoryTree;
        }

        if (!conflict) {
            currentLevel[parts[parts.length - 1]] = file;
        }
    }
    return tree;
};

const Breadcrumb: React.FC<{ path: string[], setPath: (path: string[]) => void }> = ({ path, setPath }) => (
    <nav className="flex items-center text-sm text-gray-400 mb-4 flex-wrap" aria-label="Breadcrumb">
        <button onClick={() => setPath([])} className="hover:text-white">Root</button>
        {path.map((part, index) => (
            <React.Fragment key={index}>
                <ChevronRightIcon className="w-4 h-4 mx-1 flex-shrink-0" />
                <button 
                    onClick={() => setPath(path.slice(0, index + 1))}
                    className={`hover:text-white truncate max-w-[100px] sm:max-w-none ${index === path.length - 1 ? 'text-white font-semibold' : ''}`}
                >
                    {part}
                </button>
            </React.Fragment>
        ))}
    </nav>
);

const RenameInput: React.FC<{
    currentName: string;
    onRename: (newName: string) => void;
    onCancel: () => void;
    icon: React.ReactNode;
}> = ({ currentName, onRename, onCancel, icon }) => {
    const [name, setName] = useState(currentName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSubmit = () => {
        if (name.trim() && name.trim() !== currentName) {
            onRename(name.trim());
        } else {
            onCancel();
        }
    };
    
    return (
        <div className="flex items-center p-1.5 rounded-lg bg-white/10 w-full">
            <div className="relative w-10 h-10 flex-shrink-0 mr-3 rounded flex items-center justify-center bg-gray-800/50">
                {icon}
            </div>
            <input
                ref={inputRef}
                type="text"
                value={name}
                onClick={e => e.stopPropagation()}
                onChange={e => setName(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={e => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') onCancel();
                }}
                className="w-full bg-transparent text-base font-semibold text-white focus:outline-none"
            />
        </div>
    );
}

const Browse: React.FC<BrowseProps> = ({ 
    onLibraryScanned,
    onSelectMedia,
    onAddToQueue,
    onAddToPlaylist,
    playlists,
    requestConfirmation,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allFiles, setAllFiles] = useState<Map<string, File>>(new Map());
  const [directoryTree, setDirectoryTree] = useState<DirectoryTree | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [rootFolderName, setRootFolderName] = useState<string>('');
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [permissionState, setPermissionState] = useState<'unknown' | 'prompt' | 'granted' | 'denied'>('unknown');
  const [viewMode, setViewMode] = useState<LibraryViewMode>('list');
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const [mediaItemsCache, setMediaItemsCache] = useState<Map<string, MediaItem>>(new Map());
  const coverArtUrls = useRef(new Set<string>());
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasFSApi = 'showDirectoryPicker' in window;

  useEffect(() => {
      return () => {
          coverArtUrls.current.forEach(url => URL.revokeObjectURL(url));
      };
  }, []);

  const processFiles = useCallback(async (filesMap: Map<string, File>) => {
      setIsProcessing(true);
      
      coverArtUrls.current.forEach(url => URL.revokeObjectURL(url));
      coverArtUrls.current.clear();

      const newCache = new Map<string, MediaItem>();
      const directoryCovers = new Map<string, string>();

      // First pass: find all directory covers
      for (const [path, file] of filesMap.entries()) {
          const lowerName = file.name.toLowerCase();
          if (['cover.jpg', 'cover.jpeg', 'cover.png', 'folder.jpg', 'folder.jpeg', 'folder.png'].includes(lowerName)) {
              const dirPath = path.substring(0, path.lastIndexOf('/') + 1);
              if (!directoryCovers.has(dirPath)) {
                  const url = URL.createObjectURL(file);
                  coverArtUrls.current.add(url);
                  directoryCovers.set(dirPath, url);
              }
          }
      }

      const mediaFileEntries = Array.from(filesMap.entries()).filter(([, file]) => isMedia(file));
      
      const promises = mediaFileEntries.map(async ([path, file]) => {
          const id = generateStableId(file);
          // Base media item with intelligent fallbacks from path
          const pathParts = path.split('/').filter(p => p);
          let artist = 'Unknown Artist';
          let album = 'Unknown Album';
          if (pathParts.length >= 3) {
            album = pathParts[pathParts.length - 2];
            artist = pathParts[pathParts.length - 3];
          } else if (pathParts.length === 2) {
              album = pathParts[pathParts.length - 2];
          }
          
          let mediaItem: Omit<MediaItem, 'src'> = {
              id, title: file.name.replace(/\.[^/.]+$/, ""), artist, album, genre: 'Unknown',
              type: isAudio(file) ? MediaType.AUDIO : MediaType.VIDEO,
              coverArt: `https://picsum.photos/seed/${id}/400`,
          };

          const dirPath = path.substring(0, path.lastIndexOf('/') + 1);
          if (directoryCovers.has(dirPath)) {
              mediaItem.coverArt = directoryCovers.get(dirPath)!;
          }

          if (isAudio(file) && typeof jsmediatags !== 'undefined') {
              try {
                  const tags: any = await new Promise((resolve, reject) => {
                      jsmediatags.read(file, { onSuccess: resolve, onError: reject });
                  });
                  if (tags.tags) {
                      mediaItem.title = tags.tags.title || mediaItem.title;
                      mediaItem.artist = tags.tags.artist || mediaItem.artist;
                      mediaItem.album = tags.tags.album || mediaItem.album;
                      mediaItem.genre = tags.tags.genre || mediaItem.genre;
                      
                      if (tags.tags.picture) {
                          const { data, format } = tags.tags.picture;
                          const blob = new Blob([new Uint8Array(data)], { type: format });
                          const url = URL.createObjectURL(blob);
                          coverArtUrls.current.add(url);
                          mediaItem.coverArt = url;
                      }
                  }
              } catch (error) { /* Ignore metadata read errors */ }
          }
          newCache.set(path, mediaItem as MediaItem);
      });

      await Promise.all(promises);
      setMediaItemsCache(newCache);
      setIsProcessing(false);
  }, []);

  const scanDirectory = useCallback(async (directoryHandle: FileSystemDirectoryHandle) => {
    setIsScanning(true);
    setError(null);
    const filesMap = new Map<string, File>();

    async function getFilesRecursively(entry: FileSystemHandle, path: string) {
        try {
            if (entry.kind === 'file') {
                const file = await (entry as FileSystemFileHandle).getFile();
                filesMap.set(path + entry.name, file);
            } else if (entry.kind === 'directory') {
                const newPath = path + entry.name + '/';
                for await (const handle of (entry as FileSystemDirectoryHandle).values()) {
                    await getFilesRecursively(handle, newPath);
                }
            }
// FIX: Add type guard for caught exception to safely handle errors during file scanning.
        } catch (e) {
            if (e instanceof Error) {
                console.warn(`Could not read file or directory '${entry.name}': ${e.message}`);
            } else {
                console.warn(`Could not read file or directory '${entry.name}':`, e);
            }
        }
    }
    
    await getFilesRecursively(directoryHandle, '');
    
    setAllFiles(filesMap);
    setDirectoryTree(parseFilesMapToTree(filesMap));
    setRootFolderName(directoryHandle.name);
    setCurrentPath([]);
    await processFiles(filesMap);
    setIsScanning(false);
  }, [processFiles]);
  
  const triggerFileSelect = () => inputRef.current?.click();

  const handleFolderSelect = async () => {
    if (hasFSApi) {
      try {
        const handle = await (window as unknown as WindowWithPicker).showDirectoryPicker({ mode: 'readwrite' });
        setDirHandle(handle);
        await idb.set('directoryHandle', handle);
        setPermissionState('granted');
        await scanDirectory(handle);
// FIX: Add type guard for caught exception to safely access error properties.
      } catch (e) {
        if (e instanceof Error) {
            if (e.name === 'AbortError') return;
            if (e.name === 'SecurityError' || e.message.includes('Cross origin sub frame')) {
              console.warn("File System Access API is not available. Falling back to legacy input.");
              triggerFileSelect();
            } else {
              console.error("Error selecting directory:", e);
              setError("Failed to access directory. Please try again.");
            }
        } else {
          console.error("Error selecting directory:", e);
          setError("Failed to access directory. Please try again.");
        }
      }
    } else {
      triggerFileSelect();
    }
  };
  
  const handleLegacyFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const filesMap = new Map<string, File>();
    fileList.forEach(file => {
      const path = (file as any).webkitRelativePath || file.name;
      filesMap.set(path, file);
    });

    setAllFiles(filesMap);
    const tree = parseFilesMapToTree(filesMap);
    const firstPath = (files[0] as any).webkitRelativePath;
    const rootName = firstPath ? firstPath.split('/')[0] : 'Selected Files';
    setRootFolderName(rootName);
    setDirectoryTree(tree);
    setCurrentPath([]);
    setError(null);
    await processFiles(filesMap);
  };
  
  useEffect(() => {
    async function loadSavedHandle() {
      if (!hasFSApi) {
        setIsLoading(false);
        return;
      }
      try {
        const savedHandle = await idb.get<FileSystemDirectoryHandle>('directoryHandle');
        if (savedHandle) {
          const permission = await savedHandle.queryPermission({ mode: 'readwrite' });
          setPermissionState(permission);
          setDirHandle(savedHandle); 
          if (permission === 'granted') {
            await scanDirectory(savedHandle);
          }
        }
      } catch (e) {
        if (e instanceof Error) {
          console.error("Error loading saved directory handle:", e.name, e.message);
        } else {
          console.error("Error loading saved directory handle:", e);
        }
        idb.delete('directoryHandle');
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedHandle();
  }, [hasFSApi, scanDirectory]);

    const handleReconnect = async () => {
    if (!dirHandle) return;
    try {
        const permission = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (permission === 'granted') {
            setPermissionState('granted');
            await scanDirectory(dirHandle);
        } else {
            setPermissionState('denied');
            setError("Permission to access the folder was denied.");
            setDirHandle(null);
            await idb.delete('directoryHandle');
        }
// FIX: Add type guard for caught exception to safely access error properties.
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          return;
        }
        console.error("Error requesting permission:", e);
        setError("An error occurred while trying to get permission.");
        setDirHandle(null);
        await idb.delete('directoryHandle');
    }
  };

  useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuPath(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

  const handleSyncSelected = useCallback(() => {
    setError(null);
    setIsProcessing(true);
    
    const paths = Array.from(selectedPaths);
    const filesToSync = paths
      .map(path => allFiles.get(hasFSApi ? path : `${rootFolderName}/${path}`))
      .filter((file): file is File => !!file && isMedia(file));

    const pathToFileMap = new Map(Array.from(allFiles.entries()).map(([p, f]) => [f, p]));

    setTimeout(() => {
        const allMediaItems: MediaItem[] = filesToSync.map(file => {
            const path = pathToFileMap.get(file) || '';
            const cachedItem = mediaItemsCache.get(path);
            
            if (cachedItem) {
                return { ...cachedItem, src: URL.createObjectURL(file) };
            }

            const id = generateStableId(file);
            return {
                id, title: file.name.replace(/\.[^/.]+$/, ""), artist: 'Local File', album: 'Unknown Album',
                genre: 'Unknown', type: isAudio(file) ? MediaType.AUDIO : MediaType.VIDEO,
                src: URL.createObjectURL(file), coverArt: `https://picsum.photos/seed/${id}/400`,
            }
        });

        onLibraryScanned(allMediaItems);
        setIsProcessing(false);
        setIsSelectionMode(false);
        setSelectedPaths(new Set());
    }, 500);
  }, [selectedPaths, allFiles, hasFSApi, rootFolderName, onLibraryScanned, mediaItemsCache]);
  
    const getParentHandleAndName = async (path: string): Promise<{parent: FileSystemDirectoryHandle, name: string} | null> => {
      if (!dirHandle) return null;
      const parts = path.split('/');
      const name = parts.pop();
      if (!name) return null;

      let parent = dirHandle;
      for (const part of parts) {
          try {
              parent = await parent.getDirectoryHandle(part);
          } catch(e) {
              console.error(`Could not get directory handle for ${part}`, e);
              return null;
          }
      }
      return { parent, name };
  };

  const handleRename = async (path: string, newName: string) => {
    setRenamingPath(null);
    if (!newName.trim() || newName.includes('/')) {
        setError("Invalid name");
        return;
    }

    const info = await getParentHandleAndName(path);
    if (!info) {
        setError("Could not find item to rename.");
        return;
    }
    
    try {
        let handle;
        try {
            handle = await info.parent.getFileHandle(info.name);
        } catch (e) {
            handle = await info.parent.getDirectoryHandle(info.name);
        }

        await (handle as any).move(newName);
        await scanDirectory(dirHandle!);
// FIX: Add type guard for caught exception to safely access error properties.
    } catch (e) {
        if (e instanceof Error) {
            console.error("Rename failed:", e);
            setError(`Rename failed: ${e.message}.`);
        } else {
            console.error("Rename failed with unknown error:", e);
            setError('Rename failed with an unknown error.');
        }
    }
  };

  const handleDeleteSelected = async () => {
      const pathsToDelete = Array.from(selectedPaths);
      requestConfirmation(
        `Delete ${pathsToDelete.length} item(s)`,
        `Are you sure you want to permanently delete the selected items? This action cannot be undone.`,
        async () => {
            setIsProcessing(true);
            setError(null);
            try {
                for(const path of pathsToDelete) {
                    const info = await getParentHandleAndName(path);
                    if (!info) {
                      console.warn(`Could not find item to delete at path: ${path}`);
                      continue;
                    }
                     try {
                        let isDirectory = false;
                        try {
                          await info.parent.getDirectoryHandle(info.name);
                          isDirectory = true;
                        } catch {
                          // Ignore, assume it's a file if getDirectoryHandle fails
                        }
                        await info.parent.removeEntry(info.name, { recursive: isDirectory });
// FIX: Ensure only strings are passed to setError for type safety.
                    } catch (e) {
                       console.error(`Failed to delete ${path}`, e);
                       if (e instanceof Error) {
                           setError(`Error deleting ${info.name}: ${e.message}`);
                       } else {
                           setError(`Error deleting ${info.name}.`);
                       }
                       break; 
                    }
                }
            } finally {
                await scanDirectory(dirHandle!);
                setIsProcessing(false);
                setIsSelectionMode(false);
                setSelectedPaths(new Set());
            }
        }
    );
  };
  
  const handleDeleteSingle = (path: string) => {
    setSelectedPaths(new Set([path]));
    setTimeout(() => handleDeleteSelected(), 50);
  };

  const getCurrentContent = (tree: DirectoryTree, path: string[]): DirectoryTree | null => {
      let currentLevel: DirectoryTree | File = tree;
      for (const part of path) {
          if (typeof currentLevel === 'object' && !(currentLevel instanceof File) && currentLevel[part]) {
              currentLevel = currentLevel[part];
          } else {
              return null;
          }
      }
      return currentLevel instanceof File ? null : currentLevel;
  };
  
  const currentContent = useMemo(() => {
      if (!directoryTree) return null;
      const effectivePath = !hasFSApi && rootFolderName ? [rootFolderName, ...currentPath] : currentPath;
      return getCurrentContent(directoryTree, effectivePath);
  }, [directoryTree, currentPath, rootFolderName, hasFSApi]);


  const folders = useMemo(() => Object.entries(currentContent || {}).filter((entry): entry is [string, DirectoryTree] => !(entry[1] instanceof File)).sort(([a], [b]) => a.localeCompare(b)), [currentContent]);
  const files = useMemo(() => Object.entries(currentContent || {}).filter((entry): entry is [string, File] => entry[1] instanceof File).sort(([a], [b]) => a.localeCompare(b)), [currentContent]);
  
  const mediaItemsInCurrentDir = useMemo(() => {
    return files.filter(([, file]) => isMedia(file)).map(([name, file]) => {
        const path = [...currentPath, name].join('/');
        const fullPath = hasFSApi ? path : `${rootFolderName}/${path}`;
        const fallbackId = generateStableId(file);
        const item = mediaItemsCache.get(fullPath) || {
            id: fallbackId, title: name.replace(/\.[^/.]+$/, ""), artist: 'Loading...', album: '...',
            type: isAudio(file) ? MediaType.AUDIO : MediaType.VIDEO,
            src: '', coverArt: `https://picsum.photos/seed/${fallbackId}/400`,
        };
        return { name, item, path, file };
    });
  }, [files, currentPath, mediaItemsCache, hasFSApi, rootFolderName]);
  
  const nonMediaFiles = useMemo(() => files.filter(([, file]) => !isMedia(file)), [files]);

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedPaths(new Set());
  };
  
  const handleInitiateSelection = (path: string) => {
      setIsSelectionMode(true);
      setSelectedPaths(new Set([path]));
      setOpenMenuPath(null);
  }
  
  const handleItemClick = (path: string, isFolder: boolean, file?: File, item?: MediaItem) => {
    if (isSelectionMode) {
      const newSelected = new Set(selectedPaths);
      if (newSelected.has(path)) {
        newSelected.delete(path);
      } else {
        newSelected.add(path);
      }
      setSelectedPaths(newSelected);
    } else {
      if (isFolder) {
        const newPart = path.split('/').pop();
        if (typeof newPart === 'string') {
            setCurrentPath([...currentPath, newPart]);
        }
      } else if (item && file) {
        const itemWithSrc = { ...item, src: URL.createObjectURL(file) };
        const queueContextWithSrc = mediaItemsInCurrentDir.map(({ item, file }) => ({
            ...item,
            src: URL.createObjectURL(file)
        }));
        onSelectMedia(itemWithSrc, queueContextWithSrc);
      }
    }
  };

  const allCurrentPaths = useMemo(() => [
    ...folders.map(([name]) => [...currentPath, name].join('/')),
    ...files.map(([name]) => [...currentPath, name].join('/'))
  ], [folders, files, currentPath]);

  const areAllSelected = allCurrentPaths.length > 0 && allCurrentPaths.every(path => selectedPaths.has(path));

  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(allCurrentPaths));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-8 h-8 text-gray-400" /></div>;
  }

  const showSelectFolderScreen = !directoryTree || (hasFSApi && permissionState === 'denied');

  const renderContent = () => {
    if (hasFSApi && dirHandle && permissionState === 'prompt') {
      return (
        <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-200">Reconnect to Your Library</h2>
            <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-8">
                <FolderIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">You previously connected the folder:</p>
                <p className="text-lg font-semibold text-white mb-6">{dirHandle.name}</p>
                <p className="text-gray-400 mb-6">To continue, please grant access again.</p>
                <button onClick={handleReconnect} className="px-6 py-3 font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto">
                    <FolderIcon className="w-5 h-5" />
                    Reconnect
                </button>
            </div>
             <p className="text-gray-500 text-sm">Or, <button onClick={handleFolderSelect} className="text-blue-400 hover:underline">select a different folder</button>.</p>
        </div>
      );
    }
  
    if (showSelectFolderScreen) {
      return (
        <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-200">Local Library Source</h2>
            <div className="bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-8">
                <FolderIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                {permissionState === 'denied' && (
                    <p className="text-red-400 mb-4">Access was denied. Please select a folder again.</p>
                )}
                <p className="text-gray-400 mb-6">{hasFSApi ? 'Select a folder to browse and sync media. Access can be remembered for next time.' : 'Select a folder on your device to browse media files.'}</p>
                <button onClick={handleFolderSelect} className="px-6 py-3 font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mx-auto">
                    <FolderIcon className="w-5 h-5" />
                    Select Media Folder
                </button>
            </div>
            <div className="text-center text-gray-600 text-xs p-4">
                <p>Your files are processed locally and are not uploaded.</p>
            </div>
        </div>
      );
    }

    return (
        <div className={`space-y-4 ${selectedPaths.size > 0 ? 'pb-24' : ''}`}>
          <Breadcrumb path={currentPath} setPath={(path) => {setCurrentPath(path); setSelectedPaths(new Set());}} />
          
          <div className="min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4 h-[34px]">
                    {isSelectionMode ? (
                        <>
                            <button
                                onClick={cancelSelectionMode}
                                className="px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-white/10 text-white animate-fade-in"
                            >
                               Cancel
                            </button>
                            <div className="flex items-center gap-2 animate-fade-in">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-white focus:ring-white/50"
                                    checked={areAllSelected}
                                    onChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="text-sm font-medium text-gray-300">Select All</label>
                            </div>
                        </>
                    ) : (isScanning || isProcessing) && <div className="flex items-center gap-2 text-gray-400"><SpinnerIcon className="w-4 h-4" /><span>Processing...</span></div>}
                </div>
                <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
              
              {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-md my-2">{error}</div>}

              {viewMode === 'list' && (
                <div className="flex flex-col space-y-1 mt-2">
                    {folders.map(([name]) => {
                        const path = [...currentPath, name].join('/');
                        const isRenaming = renamingPath === path;
                        return (
                           <div key={path}>
                             {isRenaming ? (
                                <RenameInput currentName={name} onRename={(newName) => handleRename(path, newName)} onCancel={() => setRenamingPath(null)} icon={<FolderIcon className="w-6 h-6 text-gray-400" />}/>
                             ) : (
                                <FolderListItem 
                                    name={name}
                                    onClick={() => handleItemClick(path, true)}
                                    isSelectionMode={isSelectionMode}
                                    isSelected={selectedPaths.has(path)}
                                >
                                    <div className="relative ml-auto pl-2" ref={openMenuPath === path ? menuRef : null}>
                                        {!isSelectionMode && <button onClick={(e) => { e.stopPropagation(); setOpenMenuPath(openMenuPath === path ? null : path); }} className="p-1.5 rounded-full opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                                            <MoreVerticalIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                        </button>}
                                        {openMenuPath === path && (
                                            <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-30">
                                              <div className="p-1">
                                                <button onClick={() => { handleInitiateSelection(path); }} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3"><CheckCircleIcon className="w-4 h-4"/> Select</button>
                                                <button onClick={() => { setRenamingPath(path); setOpenMenuPath(null); }} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3"><EditIcon className="w-4 h-4"/> Rename</button>
                                                <button onClick={() => { handleDeleteSingle(path); setOpenMenuPath(null); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 rounded flex items-center gap-3"><TrashIcon className="w-4 h-4"/> Delete</button>
                                              </div>
                                            </div>
                                        )}
                                    </div>
                                </FolderListItem>
                             )}
                           </div>
                        );
                    })}
                    {mediaItemsInCurrentDir.map(({item, path, name, file}) => (
                        <div key={path}>
                           {renamingPath === path ? (
                                <RenameInput currentName={name} onRename={(newName) => handleRename(path, newName)} onCancel={() => setRenamingPath(null)} icon={<img src={item.coverArt} className="w-full h-full object-cover"/>}/>
                           ) : (
                                <LibraryListItem 
                                  item={item} 
                                  onSelect={() => handleItemClick(path, false, file, item)} 
                                  playlists={playlists}
                                  onAddToPlaylist={onAddToPlaylist}
                                  onAddToQueue={onAddToQueue}
                                  isSelectionMode={isSelectionMode}
                                  isSelected={selectedPaths.has(path)}
                                  onRenameRequest={() => setRenamingPath(path)}
                                  onDeleteRequest={() => handleDeleteSingle(path)}
                                  onSelectRequest={() => handleInitiateSelection(path)}
                                />
                           )}
                        </div>
                    ))}
                </div>
              )}
    
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                    {folders.map(([name]) => {
                        const path = [...currentPath, name].join('/');
                        return (
                            <FolderCard
                                key={path}
                                name={name}
                                onClick={() => handleItemClick(path, true)}
                                isSelectionMode={isSelectionMode}
                                isSelected={selectedPaths.has(path)}
                                onRenameRequest={() => setRenamingPath(path)}
                                onDeleteRequest={() => handleDeleteSingle(path)}
                                onSelectRequest={() => handleInitiateSelection(path)}
                            />
                        )
                    })}
                    {mediaItemsInCurrentDir.map(({item, path, file}) => (
                        <LibraryCard
                          key={path}
                          item={item} 
                          onSelect={() => handleItemClick(path, false, file, item)}
                          playlists={playlists}
                          onAddToPlaylist={onAddToPlaylist}
                          onAddToQueue={onAddToQueue}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedPaths.has(path)}
                          onRenameRequest={() => setRenamingPath(path)}
                          onDeleteRequest={() => handleDeleteSingle(path)}
                          onSelectRequest={() => handleInitiateSelection(path)}
                        />
                    ))}
                </div>
              )}
    
              {nonMediaFiles.map(([name]) => (
                 <div key={name} className="flex items-center p-1.5 rounded-lg group text-gray-600">
                    <div className="relative w-10 h-10 flex-shrink-0 mr-3 rounded flex items-center justify-center bg-gray-800/50"><FileGenericIcon className="w-6 h-6 text-gray-600" /></div>
                    <div className="flex-grow min-w-0"><p className="text-base font-normal text-gray-500 truncate">{name}</p></div>
                </div>
              ))}
    
              {(folders.length === 0 && files.length === 0) && (
                  <p className="text-gray-500 p-2 text-center">This directory is empty.</p>
              )}
          </div>
    
           {selectedPaths.size > 0 && isSelectionMode && (
                <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 z-30 bg-black/70 backdrop-blur-lg border-t border-gray-800 animate-slide-up-fade-in">
                     <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                         <p className="text-sm font-semibold">{selectedPaths.size} item{selectedPaths.size > 1 ? 's' : ''} selected</p>
                         <div className="flex items-center gap-2 flex-wrap justify-center">
                            <button onClick={handleSyncSelected} disabled={isProcessing} className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:bg-gray-400">
                               {isProcessing ? <SpinnerIcon className="w-4 h-4" /> : null} Sync to Library
                            </button>
                            <button onClick={handleDeleteSelected} disabled={isProcessing} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2 disabled:bg-red-800">
                               {isProcessing ? <SpinnerIcon className="w-4 h-4" /> : null} Delete
                            </button>
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <>
      <input type="file" {...{ webkitdirectory: "true" }} multiple ref={inputRef} onChange={handleLegacyFolderSelect} className="hidden" />
      {renderContent()}
    </>
  );
};

export default Browse;
