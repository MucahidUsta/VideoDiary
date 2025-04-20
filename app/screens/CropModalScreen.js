import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import VideoScrubber from '../components/VideoScrubber';
import SavedVideosModal from '../components/SavedVideosModal';
import useVideoQuery from '../hooks/useVideoQuery';
import videoService from '../services/videoService';

const metaDataSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

const CropModalScreen = ({ navigation }) => {
  const [videoUri, setVideoUri] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [savedVideosModalVisible, setSavedVideosModalVisible] = useState(false);
  
  // TanStack Query hooks
  const { useCropVideo, useVideoInfo } = useVideoQuery();
  const cropVideoMutation = useCropVideo();
  const { data: videoInfo, isLoading: isLoadingInfo } = useVideoInfo(videoUri);

  // Video bilgileri yüklendiğinde süreyi al
  useEffect(() => {
    if (videoInfo && videoInfo.duration) {
      setVideoDuration(videoInfo.duration);
      setEndTime(Math.min(videoDuration, 5)); // Başlangıçta 5 saniye veya video süresini seç
    }
  }, [videoInfo]);

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'You need to grant access to the gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      console.log('Selected video URI:', result.assets[0].uri);
      
      // Video seçildiğinde süreyi sıfırla
      setStartTime(0);
      setEndTime(5);
      
      // Manuel olarak video süresini al (TanStack query ile yüklenmesini beklemeden)
      try {
        setIsLoading(true);
        const info = await videoService.getVideoInfo(result.assets[0].uri);
        if (info && info.duration) {
          setVideoDuration(info.duration);
          setEndTime(Math.min(info.duration, 5));
        }
      } catch (error) {
        console.error('Video info error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCrop = () => {
    const result = metaDataSchema.safeParse({ name, description });
    if (!result.success) {
      Alert.alert('Error', result.error.errors[0].message);
      return;
    }

    if (!videoUri) {
      Alert.alert('Error', 'Please select a video.');
      return;
    }

    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be greater than start time.');
      return;
    }

    // TanStack Query ile kırpma işlemini başlat
    cropVideoMutation.mutate({
      videoUri,
      startTime,
      endTime,
      name,
      description,
    }, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to crop video');
      }
    });
  };

  // Başlangıç zamanını ayarla
  const handleStartTimeChange = (time) => {
    setStartTime(time);
  };

  // Bitiş zamanını ayarla
  const handleEndTimeChange = (time) => {
    setEndTime(time);
  };

  // Modaldaki bir videoyu seçtiğimizde
  const handleSelectSavedVideo = (video) => {
    if (video) {
      setVideoUri(video.uri);
      setStartTime(video.startTime);
      setEndTime(video.endTime);
      setName(video.name + " (Kopya)");
      setDescription(video.description || "");
      setSavedVideosModalVisible(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-primary">Video Kırpma</Text>
        <TouchableOpacity 
          className="bg-primary p-2 rounded-full"
          onPress={() => setSavedVideosModalVisible(true)}
        >
          <MaterialIcons name="video-library" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity
          className="bg-secondary py-3 px-4 rounded-full shadow-md flex-1 mr-2"
          onPress={pickVideo}
        >
          <Text className="text-black text-center text-lg font-medium">Galeriden Video Seç</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-blue-500 py-3 px-4 rounded-full shadow-md"
          onPress={() => setSavedVideosModalVisible(true)}
        >
          <MaterialIcons name="folder" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="mt-2">Video yükleniyor...</Text>
        </View>
      )}
      
      {videoUri && !isLoading && (
        <>
          <VideoScrubber
            videoUri={videoUri}
            totalDuration={videoDuration}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            initialStartTime={startTime}
            initialEndTime={endTime}
          />
          
          <View className="space-y-4 mt-4">
            <View>
              <Text className="text-lg text-gray-700">İsim</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Video İsmi"
                className="border border-gray-300 rounded-lg p-3 mt-1 bg-white shadow-sm"
              />
            </View>
            <View>
              <Text className="text-lg text-gray-700">Açıklama</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Açıklama"
                multiline
                className="border border-gray-300 rounded-lg p-3 mt-1 bg-white shadow-sm h-24"
              />
            </View>
          </View>
          
          <TouchableOpacity
            className="bg-primary py-3 rounded-full shadow-md mt-6"
            onPress={handleCrop}
            disabled={cropVideoMutation.isPending}
          >
            {cropVideoMutation.isPending ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-black text-center text-lg font-medium ml-2">İşleniyor...</Text>
              </View>
            ) : (
              <Text className="text-black text-center text-lg font-medium">Videoyu Kırp  <MaterialIcons name="content-cut" size={24} color="black" /></Text>
            )}
          </TouchableOpacity>
        </>
      )}
      
      <SavedVideosModal 
        visible={savedVideosModalVisible}
        onClose={() => setSavedVideosModalVisible(false)}
        onSelectVideo={handleSelectSavedVideo}
        navigation={navigation}
      />
    </ScrollView>
  );
};

export default CropModalScreen;