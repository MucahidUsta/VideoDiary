import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useVideoStore = create(
  persist(
    (set) => ({
      videos: [],
      addVideo: (video) => set((state) => ({ 
        videos: [...state.videos, video] 
      })),
      removeVideo: (id) => set((state) => ({ 
        videos: state.videos.filter((v) => v.id !== id) 
      })),
      updateVideo: (updatedVideo) => set((state) => ({
        videos: state.videos.map(video => 
          video.id === updatedVideo.id ? updatedVideo : video
        )
      })),
    }),
    {
      name: 'video-storage', // unique name for storage
      storage: createJSONStorage(() => AsyncStorage), // use AsyncStorage for React Native
    }
  )
);

export default useVideoStore;