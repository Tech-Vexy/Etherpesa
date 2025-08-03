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
					borderTopWidth: 1,
					paddingTop: 12,
					paddingBottom: 12,
					height: 70,
					elevation: 8,
					shadowColor: '#000',
					shadowOffset: {
						width: 0,
						height: -2,
					},
					shadowOpacity: 0.1,
					shadowRadius: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: '600',
					marginBottom: 4,
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
				name="agent"
				options={{
					title: "Agent",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "business" : "business-outline"}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="security"
				options={{
					title: "Security",
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon
							name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
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
			<Tabs.Screen
				name="transactions"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
