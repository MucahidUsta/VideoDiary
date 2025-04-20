import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import VideoPlayer from './VideoPlayer';
import useVideoQuery from '../hooks/useVideoQuery';


const { width, height } = Dimensions.get('window');

const SavedVideosModal = ({ visible, onClose, onSelectVideo, navigation }) => {
  const { useVideos } = useVideoQuery();
  const { data: videos, isLoading, refetch } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Modal açıldığında videoları yenile
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible]);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    if (onSelectVideo) {
      onSelectVideo(video);
    }
  };

  const handleViewDetails = (video) => {
    onClose();
    // Zaman vermek için kısa bir gecikme
    setTimeout(() => {
      navigation.navigate('Details', { video });
    }, 300);
  };

  const renderVideoItem = ({ item }) => {
    const isSelected = selectedVideo && selectedVideo.id === item.id;
    return (
      <TouchableOpacity 
        style={[
          styles.videoItem, 
          isSelected && styles.selectedVideoItem
        ]}
        onPress={() => handleSelectVideo(item)}
      >
        <View style={styles.videoContainer}>
          <VideoPlayer 
            uri={item.uri} 
            startTime={item.startTime} 
            endTime={item.endTime} 
          />
        </View>
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.detailsButtonText}>Detaylar</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
 
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kaydedilmiş Videolar</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Videolar yükleniyor...</Text>
            </View>
          ) : videos && videos.length > 0 ? (
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.videosList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="videocam-off" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Henüz kaydedilmiş video yok</Text>
              <Text style={styles.emptySubText}>
                Video kırparak burada görebilirsiniz
              </Text>
            </View>
          )}
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={onClose}
            >
              <Text style={styles.primaryButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  videosList: {
    padding: 16,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedVideoItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#f0f9f0',
  },
  videoContainer: {
    width: 250,
    height: 250,
  },
  videoInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 5,
    alignSelf: 'flex-end',
    width: 80,
    height: 30,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default SavedVideosModal; 