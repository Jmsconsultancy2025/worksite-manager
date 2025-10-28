import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getUserSubscription, setUserSubscription, PLAN_LIMITS } from '../lib/storage';


const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 'Free',
    period: 'forever',
    sites: '1 site',
    workers: 'Up to 10 workers',
    features: [
      'Basic attendance tracking',
      'Simple payroll calculations',
      'Basic reports',
      'Email support'
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    icon: 'flash',
    color: 'green',
    popular: false,
    current: false
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    price: '₹499',
    period: 'month',
    sites: 'Up to 5 sites',
    workers: 'Up to 50 workers',
    features: [
      'Advanced attendance tracking',
      'Salary management',
      'Basic reports and analytics',
      'Payment tracking',
      'Priority email support',
      'Data export features'
    ],
    buttonText: 'Upgrade to Standard',
    buttonVariant: 'default' as const,
    icon: 'star',
    color: 'blue',
    popular: true,
    current: false
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '₹999',
    period: 'month',
    sites: 'Unlimited sites',
    workers: 'Unlimited workers',
    features: [
      'Everything in Standard',
      'Advanced reports and analytics',
      'Export functionality',
      'Custom fields',
      'Priority support',
      'API access',
      'Custom integrations'
    ],
    buttonText: 'Go Pro',
    buttonVariant: 'default' as const,
    icon: 'crown',
    color: 'gold',
    popular: false,
    current: false
  }
];

export default function PlansPage() {
  const router = useRouter();
  const [currentSubscription, setCurrentSubscription] = useState({ plan: 'basic', status: 'active' });
  const [plansData, setPlansData] = useState(plans);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const subscription = await getUserSubscription();
        setCurrentSubscription(subscription);
        console.log('DEBUG subscription load', { subscription, getUserSubscription: typeof getUserSubscription });

        // Update plans to mark current plan
        setPlansData(plans.map(plan => ({
          ...plan,
          current: plan.id === subscription.plan,
          buttonText: plan.id === subscription.plan ? 'Current Plan' :
                     plan.id === 'basic' ? 'Downgrade' : `Upgrade to ${plan.name.split(' ')[0]}`
        })));
      } catch (error) {
        console.error('Error loading subscription:', error);
        setCurrentSubscription({ plan: 'basic', status: 'active' });
      }
    };
    loadSubscription();
  }, []);

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentSubscription.plan) {
      Alert.alert('Already Subscribed', `You are already on the ${plans.find(p => p.id === planId)?.name}`);
      return;
    }

    // For demo purposes, we'll simulate plan upgrade
    // In a real app, this would integrate with payment processing
    Alert.alert(
      'Confirm Plan Change',
      `Are you sure you want to ${planId === 'basic' ? 'downgrade to' : 'upgrade to'} ${plans.find(p => p.id === planId)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await setUserSubscription({ plan: planId, status: 'active' });
            if (success) {
              setCurrentSubscription({ plan: planId, status: 'active' });
              setPlansData(plans.map(plan => ({
                ...plan,
                current: plan.id === planId,
                buttonText: plan.id === planId ? 'Current Plan' :
                           plan.id === 'basic' ? 'Downgrade' : `Upgrade to ${plan.name.split(' ')[0]}`
              })));
              Alert.alert('Success', `Successfully ${planId === 'basic' ? 'downgraded to' : 'upgraded to'} ${plans.find(p => p.id === planId)?.name}!`);
            } else {
              Alert.alert('Error', 'Failed to update subscription. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return '#16A34A';
      case 'blue': return '#3B82F6';
      case 'gold': return '#CA8A04';
      default: return '#6B7280';
    }
  };

  const getIconBackground = (color: string) => {
    switch (color) {
      case 'green': return '#DCFCE7';
      case 'blue': return '#DBEAFE';
      case 'gold': return '#FEF3C7';
      default: return '#F3F4F6';
    }
  };

  const getButtonStyle = (plan: any) => {
    if (plan.current) {
      return {
        backgroundColor: '#F3F4F6',
        borderColor: '#D1D5DB',
      };
    }
    switch (plan.color) {
      case 'blue': return { backgroundColor: '#3B82F6' };
      case 'gold': return { backgroundColor: '#CA8A04' };
      default: return {};
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choose Your Worksite Plan</Text>
          <Text style={styles.headerSubtitle}>Select a plan that matches your team's needs</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Message */}
        <View style={styles.topMessage}>
          <Text style={styles.topMessageText}>
            Upgrade anytime • No hidden fees • Cancel anytime
          </Text>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansContainer}>
          {plansData.map((plan, index) => (
            <View key={plan.id} style={[styles.planCardWrapper, index > 0 && styles.planCardSpacing]}>
              <Card style={[
                styles.planCard,
                plan.current && styles.currentPlanCard,
                plan.popular && styles.popularPlanCard,
              ]}>
                {/* Badge */}
                {plan.popular && (
                  <View style={styles.badgeContainer}>
                    <Badge style={[styles.badge, styles.popularBadge]}>
                      Most Popular
                    </Badge>
                  </View>
                )}
                {plan.current && (
                  <View style={styles.badgeContainer}>
                    <Badge style={[styles.badge, styles.currentBadge]}>
                      Current Plan
                    </Badge>
                  </View>
                )}

                <CardHeader style={styles.cardHeader}>
                  <View style={styles.planHeader}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons
                        name={plan.icon as any}
                        size={20}
                        color={getIconColor(plan.color)}
                        style={styles.icon}
                      />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceAmount}>{plan.price}</Text>
                        {plan.period !== 'forever' && (
                          <Text style={styles.pricePeriod}>/ {plan.period}</Text>
                        )}
                        {plan.period === 'forever' && (
                          <Text style={styles.priceForever}>forever</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </CardHeader>

                <CardContent style={styles.cardContent}>
                  <View style={styles.planLimits}>
                    <View style={styles.limitItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.limitText}>{plan.sites}</Text>
                    </View>
                    <View style={styles.limitItem}>
                      <View style={styles.bulletPoint} />
                      <Text style={styles.limitText}>{plan.workers}</Text>
                    </View>
                  </View>

                  <View style={styles.featuresList}>
                    {plan.features.map((feature, featureIndex) => (
                      <View key={featureIndex} style={styles.featureItem}>
                        <MaterialIcons name="check" size={16} color="#16A34A" style={styles.checkIcon} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      variant={plan.buttonVariant}
                      disabled={plan.current}
                      style={[styles.planButton, getButtonStyle(plan)]}
                      onPress={() => handlePlanSelect(plan.id)}
                    >
                      {plan.buttonText}
                    </Button>
                  </View>
                </CardContent>
              </Card>
            </View>
          ))}
        </View>

        {/* Plan Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Plan Comparison</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Features</Text>
              <Text style={styles.tableHeaderText}>Basic</Text>
              <Text style={styles.tableHeaderText}>Standard</Text>
              <Text style={styles.tableHeaderText}>Pro</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Workers</Text>
              <Text style={styles.tableValue}>10</Text>
              <Text style={styles.tableValue}>50</Text>
              <Text style={styles.tableValue}>Unlimited</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Sites</Text>
              <Text style={styles.tableValue}>1</Text>
              <Text style={styles.tableValue}>5</Text>
              <Text style={styles.tableValue}>Unlimited</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Attendance Tracking</Text>
              <Text style={styles.tableValue}>✓</Text>
              <Text style={styles.tableValue}>✓</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Salary Management</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✓</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Advanced Reports</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✓</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Export Data</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✓</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>Custom Fields</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableFeature}>API Access</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✗</Text>
              <Text style={styles.tableValue}>✓</Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help Choosing?</Text>
          <Text style={styles.helpDescription}>
            Not sure which plan is right for you? We're here to help you find the perfect fit for your construction business.
          </Text>
          <View style={styles.helpButtons}>
            <Button variant="outline" size="sm" style={styles.helpButton}>
              Contact Sales
            </Button>
            <Button variant="outline" size="sm" style={styles.helpButton}>
              Schedule Demo
            </Button>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              <Text style={styles.faqLabel}>Q:</Text> Can I change plans anytime?
            </Text>
            <Text style={styles.faqAnswer}>
              <Text style={styles.faqLabel}>A:</Text> Yes, you can upgrade or downgrade your plan at any time.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              <Text style={styles.faqLabel}>Q:</Text> What happens to my data if I downgrade?
            </Text>
            <Text style={styles.faqAnswer}>
              <Text style={styles.faqLabel}>A:</Text> Your data remains safe. You'll just have access limits based on your new plan.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              <Text style={styles.faqLabel}>Q:</Text> How secure is my data?
            </Text>
            <Text style={styles.faqAnswer}>
              <Text style={styles.faqLabel}>A:</Text> Your data is protected with end-to-end encryption. Even our development team cannot access your sensitive information.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              <Text style={styles.faqLabel}>Q:</Text> Do you offer discounts for annual billing?
            </Text>
            <Text style={styles.faqAnswer}>
              <Text style={styles.faqLabel}>A:</Text> Yes! Contact our sales team for annual billing discounts.
            </Text>
          </View>
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
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Top Message
  topMessage: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  topMessageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Plan Cards
  plansContainer: {
    marginBottom: 32,
  },
  planCardWrapper: {
    position: 'relative',
  },
  planCardSpacing: {
    marginTop: 16,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentPlanCard: {
    borderColor: '#16A34A',
    borderWidth: 2,
  },
  popularPlanCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: 16,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularBadge: {
    backgroundColor: '#3B82F6',
  },
  currentBadge: {
    backgroundColor: '#16A34A',
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    backgroundColor: 'transparent',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceForever: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '500',
    marginLeft: 4,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  planLimits: {
    marginBottom: 16,
  },
  limitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginRight: 8,
  },
  limitText: {
    fontSize: 14,
    color: '#374151',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    paddingTop: 8,
  },
  planButton: {
    width: '100%',
  },
  // Help Section
  helpSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
  },
  // FAQ Section
  faqSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  faqLabel: {
    fontWeight: 'bold',
  },
  // Plan Comparison Table
  comparisonSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonTable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableFeature: {
    flex: 2,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  tableValue: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});