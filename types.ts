
export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export interface MediaItem {
  id: number;
  title: string;
  artist: string;
  type: MediaType;
  src: string;
  coverArt: string;
  category?: string;
}

export enum View {
  BROWSE = 'browse',
  AUDIO = 'audio',
  VIDEO = 'video',
  PLAYLIST = 'playlist',
  TRANSCRIBE = 'transcribe',
}

export interface Playlist {
  id: number;
  name: string;
  mediaIds: number[];
}

export type LibraryViewMode = 'grid' | 'list';

export type RepeatMode = 'off' | 'one' | 'all';