import AsyncStorage from "@react-native-async-storage/async-storage";

export type DownloadItem = {
  title: string;
  uri: string;
};

export const getDownloads = async (): Promise<DownloadItem[]> => {
  try {
    const downloads = await AsyncStorage.getItem("download");
    return downloads ? JSON.parse(downloads) : [];
  } catch (error) {
    console.error("Error getting downloads", error);
    return [];
  }
};

export const addDownload = async (item: DownloadItem) => {
  try {
    const downloads = await getDownloads();
    downloads.push(item);
    await AsyncStorage.setItem("download", JSON.stringify(downloads));
  } catch (error) {
    console.error("Error getting downloads", error);
  }
};
