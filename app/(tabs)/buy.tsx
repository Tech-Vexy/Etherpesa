import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import { walletContract } from '@/constants/thirdweb';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ThemedButton';
import { WalletConnect } from '@/components/WalletConnect';
import { AmountInput } from '@/components/AmountInput';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { openTransakBuy } from '@/utils/transak';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ParallaxScrollView } from '@/components/ParallaxScrollView';
import { openURL } from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '@/constants/thirdweb';

export default function BuyScreen() {
	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={require("@/assets/images/title.png")}
					style={styles.reactLogo}
				/>
			}
		>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Buy with crypto or fiat</ThemedText>
			</ThemedView>
			<BuySection />
		</ParallaxScrollView>
	);
}

function BuySection() {
	const borderColor = useThemeColor(
		{ light: Colors.light.border, dark: Colors.dark.border },
		"border",
	);
	return (
		<ThemedView style={[styles.stepContainer, { borderColor }]}>
			<ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
				thirdweb hoodie (Large)
			</ThemedText>
			<Image
				source={{
					uri: "https://playground.thirdweb.com/drip-hoodie.png",
				}}
				style={styles.buyImage}
			/>
			<ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
				Price: $2.00
			</ThemedText>
			<ThemedView style={{ gap: 8, marginTop: 16 }}>
				<ThemedButton
					title="Pay with Metamask"
					onPress={async () => {
						const url = await makeUrl();
						const mmUrl = new URL(
							`https://metamask.app.link/dapp/${url.toString()}`,
						);
						openURL(mmUrl.toString());
					}}
				/>
				<ThemedButton
					title="Pay with Phantom"
					onPress={async () => {
						const url = encodeURIComponent((await makeUrl()).toString());
						const mmUrl = new URL(
							`https://phantom.app/ul/browse/${url}?ref=${url}`,
						);
						openURL(mmUrl.toString());
					}}
				/>
			</ThemedView>
		</ThemedView>
	);
}

async function makeUrl() {
	const authToken = await AsyncStorage.getItem(
		`walletToken-${client.clientId}`,
	);
	const url = new URL("https://thirdweb.com/pay");
	url.searchParams.set("clientId", client.clientId);
	url.searchParams.set("chainId", "8453");
	url.searchParams.set(
		"tokenAddress",
		"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
	);
	url.searchParams.set(
		"recipientAddress",
		"0x2247d5d238d0f9d37184d8332aE0289d1aD9991b",
	);
	url.searchParams.set("amount", "2000000");
	url.searchParams.set("redirectUri", "com.thirdweb.demo://");
	url.searchParams.set("theme", "light");
	url.searchParams.set("name", "thirdweb hoodie");
	url.searchParams.set("preferredWallet", "io.metamask");
	url.searchParams.set(
		"image",
		"https://playground.thirdweb.com/drip-hoodie.png",
	);
	if (authToken) {
		url.searchParams.set("authCookie", authToken);
		url.searchParams.set("walletId", "inApp");
		url.searchParams.set("authProvider", "google");
	}
	return url;
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		flexDirection: "column",
		gap: 16,
		marginBottom: 8,
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
	},
	reactLogo: {
		height: "100%",
		width: "100%",
		bottom: 0,
		left: 0,
		position: "absolute",
	},
	buyImage: {
		width: "100%",
		height: 200,
	},
});
