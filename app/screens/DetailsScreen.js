import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import VideoScrubber from '../components/VideoScrubber';
import { MaterialIcons } from '@expo/vector-icons';
import useVideoStore from '../store/videoStore';

const DetailsScreen = ({ route, navigation }) => {
  const { video } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(video.name);
  const [editedDescription, setEditedDescription] = useState(video.description || '');
  const updateVideo = useVideoStore(state => state.updateVideo);

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Hata', 'Video ismi boş olamaz');
      return;
    }

    updateVideo({
      ...video,
      name: editedName.trim(),
      description: editedDescription.trim()
    });

    setIsEditing(false);
    Alert.alert('Başarılı', 'Video bilgileri güncellendi');
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary text-lg font-semibold">← Geri</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
          className="p-2"
        >
          <MaterialIcons 
            name={isEditing ? "check" : "edit"} 
            size={24} 
            color="#4CAF50" 
          />
        </TouchableOpacity>
      </View>
      
      <VideoScrubber 
        videoUri={video.uri}
        initialStartTime={video.startTime}
        initialEndTime={video.endTime}
        totalDuration={video.endTime * 1.5}
      />
      
      <View className="mt-6">
        <Text className="text-2xl font-bold text-primary">Video Detayları</Text>
        
        {isEditing ? (
          <>
            <TextInput
              className="text-xl font-semibold text-gray-800 mt-2 p-2 border border-gray-300 rounded"
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Video İsmi"
            />
            <TextInput
              className="text-gray-600 mt-1 p-2 border border-gray-300 rounded"
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Açıklama"
              multiline
            />
          </>
        ) : (
          <>
            <Text className="text-xl font-semibold text-gray-800 mt-2">
              Video İsmi: {editedName}
            </Text>
            <Text className="text-gray-600 mt-1">
              Açıklama: {editedDescription || 'Açıklama yok'}
            </Text>
          </>
        )}
        
        <Text className="text-gray-600 mt-3">
          Kırpma Aralığı: {video.startTime} - {video.endTime} saniye
        </Text>
      </View>
    </ScrollView>
  );
};

export default DetailsScreen;