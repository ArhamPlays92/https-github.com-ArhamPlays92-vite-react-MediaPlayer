
import { MediaItem, MediaType, Playlist } from './types';

export const MEDIA_FILES: MediaItem[] = [
  {
    id: 1,
    title: "Big Buck Bunny",
    artist: "Blender Foundation",
    type: MediaType.VIDEO,
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    coverArt: "https://picsum.photos/seed/bunny/400/225",
    category: "Animation",
  },
  {
    id: 2,
    title: "Elephants Dream",
    artist: "Blender Foundation",
    type: MediaType.VIDEO,
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    coverArt: "https://picsum.photos/seed/elephants/400/225",
    category: "Animation",
  },
  {
    id: 3,
    title: "Cinematic Ambience",
    artist: "SoundHelix",
    type: MediaType.AUDIO,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverArt: "https://picsum.photos/seed/sound1/400/400",
    category: "Electronic",
  },
  {
    id: 4,
    title: "Pop Dance Beat",
    artist: "SoundHelix",
    type: MediaType.AUDIO,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverArt: "https://picsum.photos/seed/sound8/400/400",
    category: "Pop",
  },
  {
    id: 5,
    title: "For Bigger Blazes",
    artist: "Blender Foundation",
    type: MediaType.VIDEO,
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    coverArt: "https://picsum.photos/seed/blazes/400/225",
    category: "Short Film",
  },
  {
    id: 6,
    title: "Rock Classic",
    artist: "SoundHelix",
    type: MediaType.AUDIO,
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    coverArt: "https://picsum.photos/seed/sound15/400/400",
    category: "Rock",
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 1,
    name: 'Blender Movies',
    mediaIds: [1, 2, 5],
  },
  {
    id: 2,
    name: 'SoundHelix Mix',
    mediaIds: [3, 4, 6],
  },
];