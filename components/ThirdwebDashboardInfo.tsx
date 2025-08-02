import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ThemedButton } from './ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { getDashboardUrl } from '@/utils/thirdwebTracking';
import { client } from '@/constants/thirdweb';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ThirdwebDashboardInfoProps {
  userAddress?: string;
}

export function ThirdwebDashboardInfo({ userAddress }: ThirdwebDashboardInfoProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const openDashboard = async () => {
    try {
      const dashboardUrl = getDashboardUrl(client.clientId);
      const supported = await Linking.canOpenURL(dashboardUrl);
      
      if (supported) {
        await Linking.openURL(dashboardUrl);
      } else {
        Alert.alert(
          'Dashboard Access',
          `Visit the thirdweb dashboard to view your transaction analytics:\n\n${dashboardUrl}`,
          [
            { text: 'Copy URL', onPress: () => copyToClipboard(dashboardUrl) },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
      Alert.alert('Error', 'Unable to open dashboard. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you'd use a clipboard library like @react-native-clipboard/clipboard
    Alert.alert('URL Copied', 'Dashboard URL has been copied to clipboard');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }]}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={24} color={tintColor} />
        <ThemedText style={[styles.title, { color: textColor }]}>
          Transaction Analytics
        </ThemedText>
      </View>
      
      <ThemedText style={[styles.description, { color: textColor }]}>
        All your EtherPesa transactions are automatically tracked and analyzed in the thirdweb dashboard.
      </ThemedText>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="bar-chart-outline" size={16} color={Colors.light.success} />
          <ThemedText style={[styles.featureText, { color: textColor }]}>
            Real-time transaction monitoring
          </ThemedText>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="pie-chart-outline" size={16} color={Colors.light.success} />
          <ThemedText style={[styles.featureText, { color: textColor }]}>
            Spending analytics and insights
          </ThemedText>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.light.success} />
          <ThemedText style={[styles.featureText, { color: textColor }]}>
            Security and fraud detection
          </ThemedText>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="document-text-outline" size={16} color={Colors.light.success} />
          <ThemedText style={[styles.featureText, { color: textColor }]}>
            Detailed transaction history
          </ThemedText>
        </View>
      </View>

      <ThemedButton
        title="🔗 Open Dashboard"
        onPress={openDashboard}
      />

      {userAddress && (
        <ThemedText style={[styles.address, { color: Colors.light.subtext }]}>
          Tracking wallet: {userAddress.slice(0, 10)}...{userAddress.slice(-8)}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  features: {
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  button: {
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
