import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ThirdwebProvider } from "thirdweb/react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "react-native";
import { Colors } from "../constants/Colors";
import { client, etherlink } from "@/constants/thirdweb";
import { handleTransakRedirect } from "@/utils/transak";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { AppLockScreen } from "@/components/AppLockScreen";
import { AutoNavigateOnConnect } from "@/components/AutoNavigateOnConnect";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// App content with security wrapper
function AppContent() {
	const colorScheme = useColorScheme();
	const { isLocked } = useSecurity();
	const [showLockScreen, setShowLockScreen] = useState(false);

	useEffect(() => {
		setShowLockScreen(isLocked);
	}, [isLocked]);

	const handleUnlock = () => {
		setShowLockScreen(false);
	};

	return (
		<>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<StatusBar
					backgroundColor={Colors.dark.background}
					barStyle="light-content"
				/>
				<AutoNavigateOnConnect />
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
			</ThemeProvider>
			{showLockScreen && <AppLockScreen onUnlock={handleUnlock} />}
		</>
	);
}

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	// Handle deep links
	useEffect(() => {
		const handleDeepLink = (url: string) => {
			console.log('Deep link received:', url);
			
			// Handle Transak redirects
			if (url.includes('transak-success') || url.includes('transactionId')) {
				handleTransakRedirect(url);
			}
		};

		// Handle initial URL when app is opened via deep link
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink(url);
			}
		});

		// Handle deep links when app is already running
		const subscription = Linking.addEventListener('url', (event) => {
			handleDeepLink(event.url);
		});

		return () => subscription?.remove();
	}, []);

	if (!loaded) {
		return null;
	}

	return (
		<ThirdwebProvider>
			<SecurityProvider>
				<AppContent />
			</SecurityProvider>
		</ThirdwebProvider>
	);
}
