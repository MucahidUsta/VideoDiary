import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import videoService from '../services/videoService';
import useVideoStore from '../store/videoStore';

export const useVideoQuery = () => {
  const queryClient = useQueryClient();
  const { addVideo, videos, removeVideo, updateVideo } = useVideoStore();

  // Video bilgilerini almak için query
  const useVideoInfo = (videoUri) => {
    return useQuery({
      queryKey: ['videoInfo', videoUri],
      queryFn: () => videoService.getVideoInfo(videoUri),
      enabled: !!videoUri,
    });
  };

  // Video kırpma işlemi mutation
  const useCropVideo = () => {
    return useMutation({
      mutationFn: async ({ videoUri, startTime, endTime, name, description }) => {
        const croppedVideoUri = await videoService.cropVideo(videoUri, startTime, endTime);

        const newVideo = {
          id: Date.now().toString(),
          uri: croppedVideoUri,
          name,
          description,
          startTime,
          endTime,
        };

        addVideo(newVideo);
        return newVideo;
      },
      onSuccess: (newVideo) => {
        // Mevcut videoları al
        const currentVideos = queryClient.getQueryData(['videos']) || [];
        // Yeni videoyu ekleyerek listeyi güncelle
        queryClient.setQueryData(['videos'], [...currentVideos, newVideo]);
      },
    });
  };

  // Tüm videoları getir
  const useVideos = () => {
    return useQuery({
      queryKey: ['videos'],
      queryFn: async () => videos,
      initialData: videos,
      // Add staleTime and cacheTime options
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache the data
    });
  };

  // Video silme mutation
  const useDeleteVideo = () => {
    return useMutation({
      mutationFn: async (id) => {
        removeVideo(id);
        return id;
      },
      onMutate: async (deletedId) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['videos']);
        
        // Get current videos
        const previousVideos = queryClient.getQueryData(['videos']);
        
        // Optimistically remove the video
        queryClient.setQueryData(['videos'], old => 
          old.filter(video => video.id !== deletedId)
        );
        
        return { previousVideos };
      },
      onError: (err, variables, context) => {
        // On error, restore previous videos
        queryClient.setQueryData(['videos'], context.previousVideos);
      },
    });
  };

  // Video güncelleme mutation
  const useUpdateVideo = () => {
    return useMutation({
      mutationFn: async (updatedVideo) => {
        updateVideo(updatedVideo);
        return updatedVideo;
      },
      onMutate: async (newVideo) => {
        await queryClient.cancelQueries(['videos']);
        
        const previousVideos = queryClient.getQueryData(['videos']);
        
        queryClient.setQueryData(['videos'], old => 
          old.map(video => video.id === newVideo.id ? newVideo : video)
        );
        
        return { previousVideos };
      },
      onError: (err, variables, context) => {
        queryClient.setQueryData(['videos'], context.previousVideos);
      },
    });
  };

  return {
    useVideoInfo,
    useCropVideo,
    useVideos,
    useDeleteVideo,
    useUpdateVideo,
  };
};

export default useVideoQuery;
