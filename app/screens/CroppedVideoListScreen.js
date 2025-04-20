import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import VideoPlayer from '../components/VideoPlayer';
import SavedVideosModal from '../components/SavedVideosModal';
import useVideoQuery from '../hooks/useVideoQuery';

const CroppedVideoListScreen = ({ navigation }) => {
  const { useVideos, useDeleteVideo, useUpdateVideo } = useVideoQuery();
  const { data: videos, isLoading } = useVideos(); // refetch'i kaldırdık
  const deleteVideoMutation = useDeleteVideo();
  const updateVideoMutation = useUpdateVideo();
  const [savedVideosModalVisible, setSavedVideosModalVisible] = useState(false);
  
  const handleDeleteVideo = (videoId, videoName) => {
    Alert.alert(
      'Video Sil',
      `"${videoName}" videosunu silmek istediğinize emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            deleteVideoMutation.mutate(videoId, {
              onError: (error) => {
                Alert.alert('Hata', 'Video silinirken bir hata oluştu.');
                console.error('Delete error:', error);
              }
            });
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('Details', { 
          video: item,
          onUpdate: (updatedVideo) => {
            updateVideoMutation.mutate(updatedVideo, {
              onError: (error) => {
                Alert.alert('Hata', 'Video güncellenirken bir hata oluştu.');
                console.error('Update error:', error);
              }
            });
          }
        })}
      >
        <VideoPlayer uri={item.uri} startTime={item.startTime} endTime={item.endTime} />
        <Text className="text-xl font-semibold text-primary mt-2">{item.name}</Text>
        <Text className="text-gray-500 mt-1">{item.description || 'Açıklama yok'}</Text>
      </TouchableOpacity>
      
      <View className="flex-row justify-end mt-2">
        <TouchableOpacity 
          style={{ marginBottom: 20 }}
          className="flex-row items-center bg-red-500 py-2 px-3 rounded-lg"
          onPress={() => handleDeleteVideo(item.id, item.name)}
        >
          <MaterialIcons name="delete" size={18} color="white" />
          <Text className="text-white ml-1">Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-primary">Kırpılmış Videolar</Text>
        <TouchableOpacity 
          className="bg-primary p-2 rounded-full"
          onPress={() => setSavedVideosModalVisible(true)}
        >
          <MaterialIcons name="video-library" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="mt-2">Videolar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-center text-gray-500 text-lg">Henüz kırpılmış video yok.</Text>
              <Text className="text-center text-gray-500">Yeni bir video eklemek için aşağıdaki butona dokunun.</Text>
            </View>
          }
        />
      )}
      
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="bg-secondary py-3 flex-1 rounded-full shadow-md mt-6"
          onPress={() => navigation.navigate('CropModal')}
        >
          <Text className="text-black text-center text-lg font-medium">Yeni Video Ekle</Text>
        </TouchableOpacity>
      </View>
      
      <SavedVideosModal 
        visible={savedVideosModalVisible}
        onClose={() => setSavedVideosModalVisible(false)}
        navigation={navigation}
      />
    </View>
  );
};

export default CroppedVideoListScreen;