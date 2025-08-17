import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentService } from '@/services/paymentService';
<<<<<<< HEAD
import { Wallet as WalletIcon, Plus, Send, FileText, Package, X, CreditCard, QrCode } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { MtnMomoService } from '@/services/mtnMomoService';
=======
import { Wallet as WalletIcon, Plus, Send, FileText, Package, X, CreditCard, QrCode } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { MtnMomoService } from '@/services/mtnMomoService';
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170

export default function WalletScreen() {
  const { userProfile, updateWalletBalance } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [productCode, setProductCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
<<<<<<< HEAD
  const [topUpPhone, setTopUpPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const params = useLocalSearchParams();

  // Open modal based on router param
  useEffect(() => {
    if (params.modal === 'topup') setShowTopUpModal(true);
    else if (params.modal === 'send') setShowPaymentModal(true);
    else if (params.modal === 'invoice') setShowInvoiceModal(true);
    else if (params.modal === 'product') setShowProductModal(true);
  }, [params.modal]);
=======
  const [topUpPhone, setTopUpPhone] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const params = useLocalSearchParams();

  // Open modal based on router param
  useEffect(() => {
    if (params.modal === 'topup') setShowTopUpModal(true);
    else if (params.modal === 'send') setShowPaymentModal(true);
    else if (params.modal === 'invoice') setShowInvoiceModal(true);
    else if (params.modal === 'product') setShowProductModal(true);
  }, [params.modal]);
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170

  const formatCurrency = (amount: number) => `SZL ${amount.toFixed(2)}`;

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!/^7\d{7}$/.test(topUpPhone)) {
      Alert.alert('Error', 'Please enter a valid MTN phone number (format: 7XXXXXXXX)');
      return;
    }
<<<<<<< HEAD
    if (!/^7\d{7}$/.test(topUpPhone)) {
      Alert.alert('Error', 'Please enter a valid MTN phone number (format: 7XXXXXXXX)');
      return;
    }
=======

>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
    if (amount > 10000) {
      Alert.alert('Error', 'Maximum top-up amount is SZL 10,000');
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
    setLoading(true);
    try {
      // Initiate MTN MoMo top-up (mocked)
      const momoResult = await MtnMomoService.initiateTopUp({
        phoneNumber: topUpPhone,
        amount,
        reference: `Wallet Top-up - SZL ${amount.toFixed(2)}`,
      });
      if (momoResult.status === 'success') {
        // Optionally poll for confirmation here
        // const status = await MtnMomoService.pollTopUpStatus(momoResult.transactionId!);
        // if (status === 'success') {
        const result = await PaymentService.topUpWallet(userProfile!.id, amount);
        if (result.success) {
          await updateWalletBalance(userProfile!.walletBalance + amount);
          setTopUpAmount('');
          setTopUpPhone('');
          Alert.alert('Success', `Wallet topped up with ${formatCurrency(amount)}`);
        } else {
          Alert.alert('Error', result.error || 'Top-up failed');
        }
        // } else { Alert.alert('Error', 'Payment not confirmed.'); }
      } else {
        Alert.alert('Error', momoResult.error || 'Mobile Money payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const handleMoMoPayment = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0 || !phoneNumber) {
      Alert.alert('Error', 'Please enter valid payment details');
      return;
    }

    if (amount > 10000) {
      Alert.alert('Error', 'Maximum top-up amount is SZL 10,000');
      return;
    }
    setLoading(true);
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
  const handleSendMoney = async () => {
    if (!amount || amount <= 0 || !receiverPhone) {
    if (!amount || amount <= 0 || !receiverPhone) {
      Alert.alert('Error', 'Please enter valid payment details');
      return;
    }
    if (!/^7\d{7}$/.test(receiverPhone)) {
      Alert.alert('Error', 'Please enter a valid MTN phone number (format: 7XXXXXXXX)');
      return;
    }
    if (!/^7\d{7}$/.test(receiverPhone)) {
      Alert.alert('Error', 'Please enter a valid MTN phone number (format: 7XXXXXXXX)');
      return;
    }
=======

>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
    if (amount > userProfile!.walletBalance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }
<<<<<<< HEAD
    setLoading(true);
    try {
      // Find receiver by phone number
      const receiverResult = await PaymentService.findUserByPhone(receiverPhone);
=======
    setLoading(true);
    try {
      // Find receiver by phone number
      const receiverResult = await PaymentService.findUserByPhone(receiverPhone);
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
      if (!receiverResult.success) {
        Alert.alert('Error', 'Recipient not found');
        setLoading(false);
        return;
      }
=======

>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
      const result = await PaymentService.processPayment(
        userProfile!.id,
        receiverResult.userId!,
        amount,
        'payment',
        `Payment to ${receiverPhone}`,
        { receiverPhone }
      );
        setReceiverPhone('');
        await updateWalletBalance(userProfile!.walletBalance - amount);
        setPaymentAmount('');
        setReceiverPhone('');
        Alert.alert('Success', `Payment of ${formatCurrency(amount)} sent successfully`);
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoicePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !invoiceId) {
      Alert.alert('Error', 'Please enter valid invoice details');
      return;
    }

    if (amount > userProfile!.walletBalance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    setLoading(true);
    try {
      // For demo, we'll create a mock merchant ID
      // In production, you'd look up the invoice to find the merchant
      const mockMerchantId = 'demo-merchant-' + invoiceId.slice(-4);
      
      const result = await PaymentService.processPayment(
        userProfile!.id,
        mockMerchantId,
        amount,
        'invoice',
        `Invoice Payment - ${invoiceId}`,
        { invoiceId }
      );

      if (result.success) {
        await updateWalletBalance(userProfile!.walletBalance - amount);
        setPaymentAmount('');
        setInvoiceId('');
        setShowInvoiceModal(false);
        Alert.alert('Success', `Invoice ${invoiceId} paid successfully`);
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Invoice payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !productCode) {
      Alert.alert('Error', 'Please enter valid product details');
      return;
    }

    if (amount > userProfile!.walletBalance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    setLoading(true);
    try {
      // For demo, we'll create a mock merchant ID based on product code
      const mockMerchantId = 'demo-merchant-' + productCode.slice(-4);
      
      const result = await PaymentService.processPayment(
        userProfile!.id,
        mockMerchantId,
        amount,
        'product',
        `Product Purchase - ${productCode}`,
        { productCode }
      );

      if (result.success) {
        await updateWalletBalance(userProfile!.walletBalance - amount);
        setPaymentAmount('');
        setProductCode('');
        setShowProductModal(false);
        Alert.alert('Success', `Product ${productCode} purchased successfully`);
      } else {
        Alert.alert('Error', result.error || 'Payment failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Product payment failed');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = (modalSetter: (value: boolean) => void) => {
    setTopUpAmount('');
    setPaymentAmount('');
    setReceiverEmail('');
    setInvoiceId('');
    setProductCode('');
<<<<<<< HEAD
    setTopUpPhone('');
    setReceiverPhone('');
=======
    setTopUpPhone('');
    setReceiverPhone('');
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
    modalSetter(false);
  };

  if (!userProfile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity style={styles.profileButton}>
          <WalletIcon size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <WalletIcon size={24} color="#3B82F6" />
          </View>
          <Text style={styles.balanceValue}>{formatCurrency(userProfile.walletBalance)}</Text>
          <Text style={styles.balanceSubtext}>PayFlow Wallet</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowTopUpModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Plus size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Top Up</Text>
            <Text style={styles.actionSubtitle}>Add money to wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
              <Send size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Send Money</Text>
            <Text style={styles.actionSubtitle}>Transfer to another user</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowInvoiceModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <FileText size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Pay Invoice</Text>
            <Text style={styles.actionSubtitle}>Pay business invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setShowProductModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <Package size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Buy Products</Text>
            <Text style={styles.actionSubtitle}>Pay for goods</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
<<<<<<< HEAD
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <TouchableOpacity onPress={() => resetModal(setShowTopUpModal)}>
=======
              <Text style={styles.modalTitle}>Top Up Wallet</Text>
              <TouchableOpacity onPress={() => resetModal(setShowTopUpModal)}>
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
<<<<<<< HEAD
              <Text style={styles.inputLabel}>MTN Mobile Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 7XXXXXXXX"
                placeholderTextColor="#6B7280"
                value={topUpPhone}
                onChangeText={setTopUpPhone}
                keyboardType="phone-pad"
                maxLength={8}
              />
=======
              <Text style={styles.inputLabel}>MTN Mobile Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 7XXXXXXXX"
                placeholderTextColor="#6B7280"
                value={topUpPhone}
                onChangeText={setTopUpPhone}
                keyboardType="phone-pad"
                maxLength={8}
              />
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
              />
              
              <View style={styles.quickAmounts}>
                {['50', '100', '200', '500'].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setTopUpAmount(amount)}
                  >
                    <Text style={styles.quickAmountText}>SZL {amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleTopUp}
                disabled={loading}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
<<<<<<< HEAD
                  {loading ? 'Processing...' : 'Top Up with MTN MoMo'}
=======
                  {loading ? 'Processing...' : 'Top Up with MTN MoMo'}
>>>>>>> af76f43d6c68b62a92b2f41c474638834710f170
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.paymentNote}>
                You will receive an MTN MoMo prompt on your phone to authorize the payment.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Send Money Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => resetModal(setShowPaymentModal)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Recipient Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 7XXXXXXXX"
                placeholderTextColor="#6B7280"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
                maxLength={8}
              />
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <View style={styles.balanceInfo}>
                <Text style={styles.balanceInfoText}>
                  Available: {formatCurrency(userProfile.walletBalance)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleSendMoney}
                disabled={loading}
              >
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Sending...' : 'Send Money'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pay Invoice Modal */}
      <Modal visible={showInvoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay Invoice</Text>
              <TouchableOpacity onPress={() => resetModal(setShowInvoiceModal)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Invoice ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter invoice ID (e.g., INV-2024-001)"
                placeholderTextColor="#6B7280"
                value={invoiceId}
                onChangeText={setInvoiceId}
              />
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <View style={styles.balanceInfo}>
                <Text style={styles.balanceInfoText}>
                  Available: {formatCurrency(userProfile.walletBalance)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleInvoicePayment}
                disabled={loading}
              >
                <FileText size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Processing...' : 'Pay Invoice'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Buy Products Modal */}
      <Modal visible={showProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Buy Products</Text>
              <TouchableOpacity onPress={() => resetModal(setShowProductModal)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Product Code</Text>
              <View style={styles.productCodeContainer}>
                <TextInput
                  style={styles.productCodeInput}
                  placeholder="Enter product code (e.g., PROD-001)"
                  placeholderTextColor="#6B7280"
                  value={productCode}
                  onChangeText={setProductCode}
                />
                <TouchableOpacity style={styles.scanButton}>
                  <QrCode size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Amount (SZL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter amount"
                placeholderTextColor="#6B7280"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
              />

              <View style={styles.balanceInfo}>
                <Text style={styles.balanceInfoText}>
                  Available: {formatCurrency(userProfile.walletBalance)}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalButton, loading && styles.buttonDisabled]}
                onPress={handleProductPayment}
                disabled={loading}
              >
                <Package size={20} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>
                  {loading ? 'Processing...' : 'Buy Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  balanceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  featureText: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  productCodeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  productCodeInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  scanButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickAmountButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  quickAmountText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceInfo: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
  },
  balanceInfoText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});