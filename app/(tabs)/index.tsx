import { Image, StyleSheet, View, useColorScheme, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { client } from "@/constants/thirdweb";
import { useState } from "react";
import { createAuth } from "thirdweb/auth";
import { ethereum } from "thirdweb/chains";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { inAppWallet } from "thirdweb/wallets/in-app";
import { baseSepolia } from "thirdweb/chains";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

const wallets = [
	inAppWallet({
		auth: {
			options: [
				"google",
				"facebook",
				"discord",
				"telegram",
				"email",
				"phone",
				"passkey",
			],
			passkeyDomain: "thirdweb.com",
		},
		smartAccount: {
			chain: baseSepolia,
			sponsorGas: true,
		},
	}),
	createWallet("io.metamask"),
	createWallet("com.coinbase.wallet", {
		appMetadata: {
			name: "EtherPesa",
		},
		mobileConfig: {
			callbackURL: "com.etherpesa.app://",
		},
		walletConfig: {
			options: "smartWalletOnly",
		},
	}),
	createWallet("me.rainbow"),
	createWallet("com.trustwallet.app"),
	createWallet("io.zerion.wallet"),
];

const thirdwebAuth = createAuth({
	domain: "localhost:3000",
	client,
});

// fake login state, this should be returned from the backend
let isLoggedIn = false;

export default function HomeScreen() {
	const account = useActiveAccount();
	const router = useRouter();
	const systemTheme = useColorScheme();
	const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	const currentTheme = isDarkMode ? 'dark' : 'light';

	return (
		<ThemedView style={styles.container}>
			{/* Header with Logo and Theme Switch */}
			<View style={styles.header}>
				<TouchableOpacity style={styles.logoButton}>
					<Image
						source={require("@/assets/images/icon.png")}
						style={styles.logo}
					/>
					<ThemedText style={styles.logoText}>EtherPesa</ThemedText>
				</TouchableOpacity>
				
				<TouchableOpacity 
					style={[styles.themeButton, { 
						backgroundColor: Colors[currentTheme].backgroundSecondary,
						borderColor: Colors[currentTheme].border,
						borderWidth: 1,
					}]} 
					onPress={toggleTheme}
				>
					<Ionicons 
						name={isDarkMode ? "sunny" : "moon"} 
						size={20} 
						color={Colors[currentTheme].text} 
					/>
				</TouchableOpacity>
			</View>

			{/* Centered Content */}
			<View style={styles.centerContent}>
				<ThemedText style={styles.title}>Welcome to EtherPesa</ThemedText>
				<ThemedText style={styles.subtitle}>
					Connect your wallet to start using our decentralized financial services
				</ThemedText>

				{/* Connect Embed Component */}
				<View style={styles.connectContainer}>
					<ConnectEmbed
						client={client}
						theme={currentTheme}
						chain={ethereum}
						wallets={wallets}
						auth={{
							async doLogin(params) {
								// fake delay
								await new Promise((resolve) => setTimeout(resolve, 2000));
								const verifiedPayload = await thirdwebAuth.verifyPayload(params);
								isLoggedIn = verifiedPayload.valid;
								
								// Immediately redirect to home page after successful login
								if (isLoggedIn) {
									router.replace('/home');
								}
							},
							async doLogout() {
								isLoggedIn = false;
							},
							async getLoginPayload(params) {
								return thirdwebAuth.generatePayload(params);
							},
							async isLoggedIn(address) {
								return isLoggedIn;
							},
						}}
					/>
				</View>

				{account && (
					<ThemedText style={styles.connectedText}>
						🎉 Successfully connected! You can now access all features.
					</ThemedText>
				)}
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 60,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 40,
		paddingHorizontal: 4,
	},
	logoButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	logo: {
		width: 40,
		height: 40,
		borderRadius: 8,
	},
	logoText: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	themeButton: {
		padding: 12,
		borderRadius: 12,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
	},
	centerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 16,
	},
	subtitle: {
		fontSize: 16,
		textAlign: 'center',
		opacity: 0.7,
		lineHeight: 24,
		marginBottom: 40,
		maxWidth: 300,
	},
	connectContainer: {
		width: '100%',
		maxWidth: 400,
		marginBottom: 20,
	},
	connectedText: {
		fontSize: 14,
		textAlign: 'center',
		opacity: 0.8,
		marginTop: 16,
	},
});
