import AsyncStorage from "@react-native-async-storage/async-storage";

export const getDownloads = async () => {
  try {
    const downloads = await AsyncStorage.getItem("downloads");
    return downloads ? JSON.parse(downloads) : [];
  } catch (error) {
    console.error("Error getting downloads", error);
  }
};

export const addDownload = async (item: any) => {
  try {
    const downloads = await getDownloads();
    downloads.push(item);
    await AsyncStorage.setItem("downloads", JSON.stringify(downloads));
  } catch (error) {
    console.error("Error getting downloads", error);
  }
};
