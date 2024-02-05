import React from "react";

import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 72,
          backgroundColor: "#1F222A",
          borderTopColor: "#1F222A",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          marginBottom: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Downloader",
          tabBarIcon: () => (
            <AntDesign name="download" size={24} color="#D6D6D6" />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Player",
          tabBarIcon: () => (
            <AntDesign name="playcircleo" size={24} color="#D6D6D6" />
          ),
        }}
      />
    </Tabs>
  );
}
