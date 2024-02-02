import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabOneScreen() {
  const [param, setParam] = useState("");
  const [data, setData] = useState<any>("");
  const [stor, setStor] = useState<string[]>([]);

  const download = async () => {
    const match = param.match(/youtu\.be\/([^?]+)/);
    if (match && match[1]) {
      const videoId = match[1];

      const res = await axios.post(
        "https://youtube-mp3-downloader-phi.vercel.app/api/youtube",
        {
          id: videoId,
        }
      );
      setData(res.data.response.link);
      const stringValue = JSON.stringify(data);
      AsyncStorage.setItem("link", stringValue);
      console.log("data", stor);
      // console.log("id", videoId);
      // console.log(data);
    } else {
      console.error("Invalid YouTube URL");
    }
  };


  const a = AsyncStorage.getItem("link").then((res) => {
    console.log("res:", res);
  });

  console.log("a", a);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: "flex-start", gap: 10 }}>
        <TextInput
          keyboardType="ascii-capable"
          style={{
            width: 300,
            height: 70,
            borderWidth: 2,
            borderColor: "white",
            color: "white",
            padding: 10,
            borderRadius: 10,
          }}
          defaultValue={param}
          onChangeText={(text) => setParam(text)}
          placeholder="YOUTUBE URL"
          placeholderTextColor="#757575"
        />
        <TouchableOpacity
          style={{
            width: 300,
            backgroundColor: "#f2AA4CFF",
            height: 50,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={download}
        >
          <Text style={{ fontWeight: "bold", fontSize: 17 }}>
            Download Video as MP3
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
