import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');

const VideoScrubber = ({ 
  videoUri, 
  totalDuration = 0, 
  onStartTimeChange, 
  onEndTimeChange,
  initialStartTime = 0,
  initialEndTime = 0,
  onCropComplete,
}) => {
  const [videoStatus, setVideoStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialStartTime);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime || totalDuration);
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (totalDuration > 0 && endTime === 0) {
      setEndTime(totalDuration);
      if (onEndTimeChange) onEndTimeChange(totalDuration);
    }
  }, [totalDuration]);

  const handlePlaybackStatusUpdate = (status) => {
    setVideoStatus(status);
    
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      
      if (status.positionMillis / 1000 >= endTime) {
        videoRef.current.pauseAsync();
        videoRef.current.setPositionAsync(startTime * 1000);
        setIsPlaying(false);
      }
    }
  };

  const handleStartTimeChange = (value) => {
    if (value < endTime) {
      setStartTime(value);
      if (onStartTimeChange) onStartTimeChange(value);
      
      if (currentTime < value) {
        videoRef.current.setPositionAsync(value * 1000);
      }
    }
  };

  const handleEndTimeChange = (value) => {
    if (value > startTime && value <= totalDuration) {
      setEndTime(value);
      if (onEndTimeChange) onEndTimeChange(value);
      
      if (currentTime > value) {
        videoRef.current.setPositionAsync(startTime * 1000);
      }
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      if (currentTime >= endTime) {
        await videoRef.current.setPositionAsync(startTime * 1000);
      }
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cropVideo = async () => {
    try {
      const outputUri = `${FileSystem.documentDirectory}cropped_${Date.now()}.mp4`;
      
     
      const command = `-i "${videoUri}" -ss ${startTime} -t ${endTime - startTime} -c:v copy -c:a copy "${outputUri}"`;
      
    
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        if (onCropComplete) {
          onCropComplete(outputUri);
        }
        return outputUri;
      } else {
        const logs = await session.getAllLogs();
        throw new Error(`FFmpeg işlemi başarısız: ${logs.map(log => log.getMessage()).join('\n')}`);
      }
    } catch (error) {
      console.error('Video kırpma hatası:', error);
      throw error;
    }
  };

  // const renderCropButton = () => (
  //   <TouchableOpacity
  //     style={styles.cropButton}
  //     onPress={cropVideo}
  //   >
  //     <MaterialIcons name="content-cut" size={24} color="white" />
  //   </TouchableOpacity>
  // );

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        resizeMode="contain"
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        positionMillis={startTime * 1000}
      />
      
      <View style={styles.timelineContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={totalDuration}
            value={currentTime}
            onValueChange={(value) => {
              videoRef.current.setPositionAsync(value * 1000);
              setCurrentTime(value);
            }}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#D3D3D3"
            thumbTintColor="#4CAF50"
          />
          
          <View style={styles.trimContainer}>
            <Slider
              style={[styles.trimSlider, styles.startSlider]}
              minimumValue={0}
              maximumValue={totalDuration}
              value={startTime}
              onValueChange={handleStartTimeChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#FF6347"
            />
            
            <Slider
              style={[styles.trimSlider, styles.endSlider]}
              minimumValue={0}
              maximumValue={totalDuration}
              value={endTime}
              onValueChange={handleEndTimeChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#FF6347"
            />
            
            <View 
              style={[
                styles.selectedRange,
                {
                  left: (startTime / totalDuration) * (width - 40),
                  width: ((endTime - startTime) / totalDuration) * (width - 40)
                }
              ]}
            />
          </View>
        </View>
        
        <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <Text style={styles.timeLabel}>Başlangıç: {formatTime(startTime)}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
          {/* {renderCropButton()} */}
        </View>
        <Text style={styles.timeLabel}>Bitiş: {formatTime(endTime)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#555',
    width: 40,
    textAlign: 'center',
  },
  sliderContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  trimContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  trimSlider: {
    width: '100%',
    height: 40,
    position: 'absolute',
  },
  startSlider: {
    zIndex: 2,
  },
  endSlider: {
    zIndex: 2,
  },
  selectedRange: {
    position: 'absolute',
    height: 5,
    backgroundColor: '#FF6347',
    top: 17.5,
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 14,
    color: '#333',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cropButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoScrubber;


const handleCropComplete = (croppedVideoUri) => {
  console.log('Kırpılan video:', croppedVideoUri);

};

<VideoScrubber

  onCropComplete={handleCropComplete}
/>;