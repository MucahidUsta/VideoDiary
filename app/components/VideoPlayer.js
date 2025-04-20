import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import VideoStyle from '../styles/Style';

const VideoPlayer = ({ uri, startTime = 0, endTime = Infinity }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(startTime * 1000);
    }
  }, [startTime, uri]);

  const handlePlaybackStatusUpdate = (status) => {
    setStatus(status);
    
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      if (status.positionMillis >= endTime * 1000 && endTime !== Infinity) {
        videoRef.current.pauseAsync();
        videoRef.current.setPositionAsync(startTime * 1000);
        setIsPlaying(false);
      }
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      if (status.positionMillis >= endTime * 1000) {
        await videoRef.current.setPositionAsync(startTime * 1000);
      }
      await videoRef.current.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={VideoStyle.video}
        resizeMode="contain"
        positionMillis={startTime * 1000}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
      />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={32}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPlayer;