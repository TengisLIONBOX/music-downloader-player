import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabOneScreen() {
  const [param, setParam] = useState("");
  const [result, setResult] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);

  const getDownloads = async () => {
    try {
      const downloads = await AsyncStorage.getItem("downloads");
      return downloads ? JSON.parse(downloads) : [];
    } catch (error) {
      console.error("Error getting downloads", error);
      return [];
    }
  };

  const addDownload = async (item: any) => {
    try {
      const updatedDownloads = [...downloads, item];
      setDownloads(updatedDownloads);
      await AsyncStorage.setItem("downloads", JSON.stringify(updatedDownloads));
    } catch (error) {
      console.error("Error adding download", error);
    }
  };

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

      try {
        const response = await axios.post(
          "https://youtube-mp3-downloader-phi.vercel.app/api/youtube",
          { id: videoId }
        );
        const { data } = response;
        setResult(data.response);
        await addDownload(data.response);
      } catch (error) {
        console.error("Error downloading video", error);
      }
    } else {
      console.error("Invalid YouTube URL");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: "flex-start", gap: 10 }}>
        <TextInput
          style={styles.input}
          defaultValue={param}
          onChangeText={(text) => setParam(text)}
          placeholder="YOUTUBE URL"
          placeholderTextColor="#757575"
        />
        <TouchableOpacity style={styles.button} onPress={download}>
          <Text style={styles.buttonText}>Download Video as MP3</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {downloads.length > 0 && (
        <View>
          {downloads.map((downloadItem: any, index) => (
            <View key={index}>
              {downloadItem && (
                <>
                  <Text>{downloadItem.title}</Text>
                  {/* <Text>{downloadItem.link}</Text> */}
                </>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
