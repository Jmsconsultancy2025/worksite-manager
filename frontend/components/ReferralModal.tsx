import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Copy, Share2, MessageCircle, Mail, Smartphone } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const referralLink = "https://worksite.app/refer/ABC123";

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(referralLink);
      setCopied(true);
      Toast.show({
        type: 'success',
        text1: 'Referral link copied!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to copy link',
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Join Worksite app and manage your construction sites efficiently! Use my referral link: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("Error", "WhatsApp is not installed on this device");
    });
  };

  const handleEmailShare = () => {
    const subject = "Join Worksite - Construction Site Management App";
    const body = `Hi there!\n\nI've been using Worksite to manage my construction sites and it's been amazing! You should try it too.\n\nUse my referral link to get started: ${referralLink}\n\nBest regards`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert("Error", "No email app found");
    });
  };

  const handleSMSShare = () => {
    const message = `Join Worksite app for construction site management! Use my referral link: ${referralLink}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(smsUrl).catch(() => {
      Alert.alert("Error", "SMS app not available");
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent style={styles.content}>
        <DialogHeader>
          <View style={styles.titleContainer}>
            <Share2 size={20} color="#2E7D32" />
            <DialogTitle>Refer a Friend</DialogTitle>
          </View>
          <DialogDescription>
            Share Worksite with friends and earn rewards when they sign up.
          </DialogDescription>
        </DialogHeader>

        <View style={styles.rewardSection}>
          <View style={styles.rewardContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.rupeeSymbol}>₹</Text>
            </View>
            <View style={styles.rewardText}>
              <Text style={styles.rewardPrimary}>Earn ₹100 when your friend signs up.</Text>
              <Text style={styles.rewardSecondary}>Both you and your friend will receive the reward!</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Referral Link</Text>
          <View style={styles.inputGroup}>
            <Input
              value={referralLink}
              editable={false}
              style={styles.input}
            />
            <Button
              variant="outline"
              size="sm"
              onPress={handleCopyLink}
              style={[
                styles.copyButton,
                copied && styles.copiedButton
              ]}
            >
              <Copy size={16} style={styles.copyIcon} />
              <Text style={[styles.copyText, copied && styles.copiedText]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Share via</Text>
          <View style={styles.shareButtons}>
            <Button
              variant="outline"
              onPress={handleWhatsAppShare}
              style={styles.shareButton}
            >
              <MessageCircle size={20} color="#16A34A" style={styles.shareIcon} />
              <Text style={styles.shareText}>Share on WhatsApp</Text>
            </Button>

            <Button
              variant="outline"
              onPress={handleEmailShare}
              style={styles.shareButton}
            >
              <Mail size={20} color="#2563EB" style={styles.shareIcon} />
              <Text style={styles.shareText}>Share via Email</Text>
            </Button>

            <Button
              variant="outline"
              onPress={handleSMSShare}
              style={styles.shareButton}
            >
              <Smartphone size={20} color="#EA580C" style={styles.shareIcon} />
              <Text style={styles.shareText}>Share via SMS</Text>
            </Button>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 400,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  rewardSection: {
    marginVertical: 16,
  },
  rewardContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rupeeSymbol: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
  },
  rewardText: {
    flex: 1,
  },
  rewardPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  rewardSecondary: {
    fontSize: 12,
    color: '#16A34A',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    fontSize: 14,
  },
  copyButton: {
    borderColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  copiedButton: {
    borderColor: '#10B981',
  },
  copyIcon: {
    marginRight: 4,
  },
  copyText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  copiedText: {
    color: '#10B981',
  },
  shareButtons: {
    gap: 8,
  },
  shareButton: {
    height: 48,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  shareIcon: {
    marginRight: 12,
  },
  shareText: {
    fontSize: 14,
  },
});