import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import Slider from "@react-native-community/slider";
import { DownloadItem, getDownloads } from "@/utils/downloads";
import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";

export default function TabTwoScreen() {
  const [sound, setSound] = useState<Audio.Sound | undefined | null>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [title, setTitle] = useState("");

  const isSeeking = useRef(false);
  const shouldPlayAtEndOfSeek = useRef(false);

  useEffect(() => {
    (async () => {
      const downloads = await getDownloads();
      setDownloads(downloads);
    })();
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (index: any) => {
    if (sound) {
      await sound.stopAsync();
      setSound(null);
      playSound(index);
    }
    if (!sound) {
      const { sound: playingSound, status } = await Audio.Sound.createAsync(
        { uri: downloads[index].uri },
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate
      );
      setSound(playingSound);
      setIsPlaying(true);
      setTitle(downloads[index].title);
      if (
        status &&
        "durationMillis" in status &&
        status.durationMillis !== undefined
      ) {
        setDuration(status.durationMillis);
      } else {
        console.warn("Duration is not available");
      }
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
    }
  };

  const currentSeconds = position > 0 ? Math.floor(position / 1000) : 0;
  const totalSeconds = duration > 0 ? Math.floor(duration / 1000) : 0;

  const getSeekSliderPosition = () => {
    if (sound != null && position != null && duration != null) {
      return position / duration;
    }
    return 0;
  };

  const onValueChange = (value: any) => {
    if (sound != null && !isSeeking.current) {
      isSeeking.current = true;
      shouldPlayAtEndOfSeek.current = isPlaying;
      sound.pauseAsync();
    }
  };

  const onSlidingComplete = async (value: any) => {
    if (sound != null) {
      isSeeking.current = false;
      const seekPosition = value * duration;
      if (shouldPlayAtEndOfSeek.current) {
        sound.playFromPositionAsync(seekPosition);
      } else {
        sound.setPositionAsync(seekPosition);
      }
    }
  };

  // AsyncStorage.clear();
  return (
    <View style={styles.container}>
      <View
        style={{
          height: 580,
          width: 380,
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {downloads.length > 0 && (
          <View>
            <FlatList
              data={downloads}
              renderItem={({ item, index }) => (
                <View key={index} style={{ paddingBottom: 7 }}>
                  {item && (
                    <>
                      <TouchableOpacity
                        style={{
                          borderWidth: 2,
                          borderColor: "white",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 380,
                          height: 50,
                        }}
                        onPress={() => playSound(index)}
                      >
                        <Text style={{ color: "white" }}>{item.title}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
      <View
        style={{
          alignItems: "center",
          width: 380,
          height: 140,
          borderTopWidth: 2,
          borderColor: "white",
        }}
      >
        <View
          style={{
            flex: 1,
            width: 320,
            padding: 20,
            justifyContent: "flex-end",
            alignItems: "center",
            height: 200,
          }}
        >
          <Text style={styles.title}>{title}</Text>

          <Slider
            style={styles.playbackSlider}
            minimumValue={0}
            maximumValue={1}
            value={getSeekSliderPosition()}
            onValueChange={onValueChange}
            onSlidingComplete={onSlidingComplete}
            maximumTrackTintColor="grey"
            thumbTintColor="white"
            step={1}
          />
          <TouchableOpacity
            onPress={() => (isPlaying ? pauseSound() : playSound(""))}
          >
            <AntDesign
              name={isPlaying ? "pause" : "caretright"}
              size={30}
              color="white"
            />
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {currentSeconds} / {totalSeconds}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight + 40,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "black",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  playbackSlider: {
    width: "100%",
    // marginBottom: 20,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
