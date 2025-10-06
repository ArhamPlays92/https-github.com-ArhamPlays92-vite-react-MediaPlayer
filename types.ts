
export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export interface MediaItem {
  id: number;
  title: string;
  artist: string;
  album: string;
  type: MediaType;
  src: string;
  coverArt: string;
  genre?: string;
}

export interface Album {
    id: string;
    title: string;
    artist: string;
    coverArt: string;
    items: MediaItem[];
}

export interface Artist {
    id: string;
    name: string;
    coverArt: string;
    albums: Album[];
}


export enum View {
  BROWSE = 'browse',
  AUDIO = 'audio',
  VIDEO = 'video',
  PLAYLIST = 'playlist',
}

export interface Playlist {
  id: number;
  name: string;
  mediaIds: number[];
}

export type LibraryViewMode = 'grid' | 'list';

export type RepeatMode = 'off' | 'one' | 'all';

export type LibrarySubView = 'all' | 'albums' | 'artists';