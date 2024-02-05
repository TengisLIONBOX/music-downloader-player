import {
  Button,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";
import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { addDownload, getDownloads } from "@/utils/downloads";

const getFormattedDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds}`;
};

const getFormattedFileSize = (size: number) => {
  const mbs = size / (1024 * 1024);
  return `${mbs.toFixed(2)} MB`;
};

export default function TabOneScreen() {
  const [param, setParam] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);

  useEffect(() => {
    const fetchDownloads = async () => {
      const data = await getDownloads();
      setDownloads(data);
    };
    fetchDownloads();
  }, []);

  const download = async () => {
    const match = param.match(/youtu\.be\/([^?]+)/);
    if (match && match[1]) {
      const videoId = match[1];

      const response = await axios.post(
        "https://youtube-mp3-downloader-phi.vercel.app/api/youtube",
        { id: videoId }
      );
      const { data } = response;
      setResult(data.response);
    } else {
      console.error("Invalid YouTube URL");
    }
  };

  const handleDownload = async () => {
    const { link, title } = result;
    const path = FileSystem.documentDirectory + `/${encodeURI(title)}.mp3`;
    const downloadResumable = FileSystem.createDownloadResumable(
      link,
      path,
      {},
      (downloadProgress) => {
        const progress = Number(
          (downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite) *
            100
        ).toFixed(1);
        setProgress(Number(progress));
      }
    );

    if (downloadResumable.savable()) {
      setIsDownloading(true);
      const downloadedFile = await downloadResumable
        .downloadAsync()
        .finally(() => {
          setIsDownloading(false);
          setIsDownloaded(true);
        });
      if (downloadedFile) {
        const uri = downloadedFile.uri;
        await addDownload({ title, uri });
      }
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "flex-start",
          gap: 10,
          alignItems: "center",
        }}
      >
        <TextInput
          style={styles.input}
          defaultValue={param}
          onChangeText={(text) => setParam(text)}
          placeholder="YOUTUBE URL"
          placeholderTextColor="#757575"
        />
        <TouchableOpacity style={styles.button} onPress={download}>
          <Text style={styles.buttonText}>Convert video</Text>
        </TouchableOpacity>
        {result && (
          <>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-start",
              }}
            >
              <Text>Title: {result.title}</Text>
              <Text>Duration: {getFormattedDuration(result.duration)}</Text>
              <Text>Size: {getFormattedFileSize(result.filesize)}</Text>
              {isDownloaded && <Text>Downloaded</Text>}
              {isDownloading && <Text>Downloading {progress}%</Text>}
              {!isDownloaded && !isDownloading && (
                <Button title="Download" onPress={handleDownload} />
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight + 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 300,
    height: 70,
    borderWidth: 2,
    borderColor: "white",
    color: "white",
    padding: 10,
    borderRadius: 10,
  },
  button: {
    width: 300,
    backgroundColor: "#f2AA4CFF",
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 17,
  },
});
