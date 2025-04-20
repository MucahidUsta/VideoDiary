import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CroppedVideoListScreen from "./screens/CroppedVideoListScreen";
import DetailsScreen from "./screens/DetailsScreen";
import CropModalScreen from "./screens/CropModalScreen";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <Stack.Navigator initialRouteName="CroppedVideoList">
        <Stack.Screen
          name="CroppedVideoList"
          component={CroppedVideoListScreen}
          options={{ header: Boolean }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ header: Boolean }}
        />
        <Stack.Screen
          name="CropModal"
          component={CropModalScreen}
          options={{ header: Boolean }}
        />
      </Stack.Navigator>
    </QueryClientProvider>
  );
}
