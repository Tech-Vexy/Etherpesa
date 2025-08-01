import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
				headerShown: false,
				tabBarStyle: {
					backgroundColor: Colors[colorScheme ?? "light"].backgroundSecondary,
					borderTopColor: Colors[colorScheme ?? "light"].border,
					paddingTop: 8,
					paddingBottom: 8,
					height: 60,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '500',
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "home" : "home-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="transfer"
				options={{
					title: "Send",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "send" : "send-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="withdraw"
				options={{
					title: "Withdraw",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "arrow-down-circle" : "arrow-down-circle-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="kyc"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "person" : "person-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="index"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="read"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="write"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="buy"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
