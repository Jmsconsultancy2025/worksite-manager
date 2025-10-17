import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AboutPageProps {
  onBack: () => void;
}

const features = [
  { icon: Users, title: "Worker Management", description: "Comprehensive workforce tracking and management" },
  { icon: Target, title: "Attendance Tracking", description: "Real-time attendance monitoring with 24-hour lock system" },
  { icon: Award, title: "Payroll System", description: "Automated payroll calculations with overtime tracking" },
  { icon: Building2, title: "Site Management", description: "Multi-site project management capabilities" },
  { icon: Building2, title: "Insightful Reports", description: "Comprehensive analytics and reporting for better decision making" }
];

const teamMembers = [
  { name: "MizTech", role: "Development Partner", avatar: "🏢" },
  { name: "Worksite Team", role: "Product Development", avatar: "👥" },
  { name: "Construction Experts", role: "Industry Consultants", avatar: "🏗️" }
];

const miztechLogo = require('../assets/images/react-logo.png'); // Placeholder for MizTech logo

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#2E7D32" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Building2 size={24} color="#FFFFFF" />
            <Text style={styles.headerTitle}>About Worksite</Text>
          </View>
        </View>

        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <ImageWithFallback
            source={{ uri: 'https://images.unsplash.com/photo-1627780538498-473424a9c46c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYm91dCUyMHVzJTIwY29tcGFueSUyMGluZm98ZW58MXx8fHwxNzU4NzgwNTA3fDA&ixlib=rb-4.1.0&q=80&w=1080' }}
            alt="About Worksite"
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Worksite</Text>
            <Text style={styles.heroSubtitle}>Revolutionizing Construction Site Management</Text>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentSection}>
          {/* App Info Card */}
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Building2 size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>About us</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={styles.description}>
                Worksite is a comprehensive construction site management application designed to streamline workforce management, attendance tracking, and payroll operations for construction companies and project managers.
              </Text>
              <View style={styles.badgesContainer}>
                <Badge variant="green">Version 1.0</Badge>
                <Badge variant="blue">Mobile-First</Badge>
                <Badge variant="purple">Construction Focus</Badge>
              </View>
            </CardContent>
          </Card>

          {/* Key Features Card */}
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Award size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>Key Features</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <feature.icon size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Development Team Card */}
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Users size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>Development Team</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.teamContainer}>
                {teamMembers.map((member, index) => (
                  <View key={index} style={styles.teamMember}>
                    <View style={styles.teamAvatar}>
                      <Text style={styles.teamAvatarText}>{member.avatar}</Text>
                    </View>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{member.name}</Text>
                      <Text style={styles.teamRole}>{member.role}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Powered By Card */}
          <Card style={[styles.card, styles.poweredByCard]}>
            <CardHeader>
              <Text style={[styles.cardTitleText, styles.poweredByTitle]}>Powered By</Text>
            </CardHeader>
            <CardContent style={styles.poweredByContent}>
              <ImageWithFallback
                source={miztechLogo}
                alt="MizTech Logo"
                style={styles.logo}
                fallbackIcon="business"
                fallbackIconSize={32}
              />
              <Text style={styles.companyName}>MizTech</Text>
              <Text style={styles.companyDescription}>
                Leading technology solutions provider dedicated to helping businesses and organizations streamline and optimize their operations with solutions that turn complex processes into simple, affordable, and easy-to-use systems—making the latest innovations accessible to everyday users.
              </Text>
              <Button variant="outline" style={styles.websiteButton}>
                <Text>Visit Website</Text>
                <ExternalLink size={16} color="#2E7D32" />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Phone size={20} color="#2E7D32" />
                <Text style={styles.cardTitleText}>Contact Information</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.contactContainer}>
                <View style={styles.contactItem}>
                  <Mail size={20} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>support@worksite.com</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={20} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>+91 98765 43210</Text>
                  </View>
                </View>
                <View style={styles.contactItem}>
                  <MapPin size={20} color="#2E7D32" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Location</Text>
                    <Text style={styles.contactValue}>Mizoram, India</Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>
            Worksite v1.0.0 - Built with ❤️ for Construction Teams
          </Text>
          <Text style={styles.footerCopyright}>
            © 2025 MizTech. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flexGrow: 1,
  },
  // Header Section
  header: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Hero Section
  heroSection: {
    height: 192,
    position: 'relative',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.6)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Content Section
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 24,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  // Features
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  // Team
  teamContainer: {
    gap: 12,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'linear-gradient(135deg, #2E7D32 0%, #16A34A 100%)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamAvatarText: {
    fontSize: 18,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  teamRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Powered By
  poweredByCard: {
    alignItems: 'center',
  },
  poweredByTitle: {
    textAlign: 'center',
  },
  poweredByContent: {
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  companyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Contact
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});