
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
} from 'react-native';

const GOLD = '#D6AE55';
const BG = '#090909';

export default function App() {
  const [tab, setTab] = useState('Wallet');
  const [balance, setBalance] = useState(0.08431);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { title: 'Demo deposit', amount: 0.025, date: 'Sample transaction' },
    { title: 'Coffee & company', amount: -0.0018, date: 'Sample transaction' },
    { title: 'Demo deposit', amount: 0.06111, date: 'Sample transaction' },
  ]);

  const money = (value) => value.toFixed(8) + ' BTC';

  const simulateSend = () => {
    const value = Number(amount);

    if (
      !/^\d+(\.\d{1,8})?$/.test(amount.trim()) ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      Alert.alert('Invalid amount', 'Enter a valid amount with up to 8 decimal places.');
      return;
    }

    if (value > balance) {
      Alert.alert('Insufficient sample balance', 'Your demo balance is too low.');
      return;
    }

    Alert.alert(
      'Confirm demo send',
      `Simulate sending ${money(value)}? No Bitcoin will be transferred.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setBalance((old) => Number((old - value).toFixed(8)));
            setTransactions((old) => [
              {
                title: 'Simulated send',
                amount: -value,
                date: 'Local simulation · not sent',
              },
              ...old,
            ]);
            setAmount('');
            setTab('Activity');
            Alert.alert('Demo complete', 'Your sample balance was updated. Nothing was sent.');
          },
        },
      ]
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>ZIDANE <Text style={{ color: GOLD }}>WALLET</Text></Text>
      <Text style={styles.demo}>● DEMO MODE</Text>
    </View>
  );

  const Wallet = () => (
    <>
      <Text style={styles.eyebrow}>YOUR PRACTICE SPACE</Text>
      <Text style={styles.heading}>Welcome back.</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.muted}>SAMPLE WALLET BALANCE</Text>
        <Text style={styles.balance}>{money(balance)}</Text>
        <Text style={styles.gold}>Practice balance · Not real funds</Text>
      </View>
      <Text style={styles.section}>Quick actions</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => setTab('Receive')}>
          <Text style={styles.actionIcon}>↓</Text>
          <Text style={styles.actionText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => setTab('Send')}>
          <Text style={styles.actionIcon}>↑</Text>
          <Text style={styles.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => setTab('Activity')}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Activity</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.section}>Recent activity</Text>
      {transactions.slice(0, 3).map((item, index) => (
        <Transaction key={index} item={item} />
      ))}
    </>
  );

  const Receive = () => (
    <>
      <Text style={styles.heading}>Receive Bitcoin</Text>
      <View style={styles.panel}>
        <Text style={styles.gold}>DEMO RECEIVE</Text>
        <Text style={styles.receiveCode}>ZIDANE-DEMO-ONLY</Text>
        <Text style={styles.muted}>
          This is a fictional demonstration label, not a Bitcoin address.
        </Text>
      </View>
      <Text style={styles.warning}>No real deposits. No blockchain connection. No QR code.</Text>
    </>
  );

  const Send = () => (
    <>
      <Text style={styles.heading}>Send Bitcoin</Text>
      <View style={styles.panel}>
        <Text style={styles.gold}>SIMULATION ONLY</Text>
        <Text style={styles.muted}>Available sample balance</Text>
        <Text style={styles.balanceSmall}>{money(balance)}</Text>
        <Text style={styles.label}>AMOUNT IN BTC</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00000000"
          placeholderTextColor="#777"
          keyboardType="decimal-pad"
        />
        <TouchableOpacity style={styles.primary} onPress={simulateSend}>
          <Text style={styles.primaryText}>SIMULATE DEMO SEND</Text>
        </TouchableOpacity>
        <Text style={styles.muted}>Nothing will be sent over a network.</Text>
      </View>
    </>
  );

  const Activity = () => (
    <>
      <Text style={styles.heading}>Activity</Text>
      <Text style={styles.muted}>Your local demo transaction history</Text>
      {transactions.map((item, index) => (
        <Transaction key={index} item={item} />
      ))}
      <Text style={styles.warning}>All transactions are fictional demo records.</Text>
    </>
  );

  const Security = () => (
    <>
      <Text style={styles.heading}>Security</Text>
      <View style={styles.panel}>
        <Text style={styles.gold}>DEMO SAFETY DETAILS</Text>
        {[
          'No private keys stored',
          'No seed phrase requested',
          'No blockchain connection',
          'No real Bitcoin transfers',
          'No real funds held',
        ].map((item) => (
          <Text style={styles.securityItem} key={item}>✓  {item}</Text>
        ))}
      </View>
      <Text style={styles.warning}>
        This practice app is not a production cryptocurrency wallet.
      </Text>
    </>
  );

  const Transaction = ({ item }) => (
    <View style={styles.transaction}>
      <View style={{ flex: 1 }}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.muted}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: item.amount > 0 ? '#65C98A' : GOLD }
      ]}>
        {item.amount > 0 ? '+' : ''}{item.amount.toFixed(8)} BTC
      </Text>
    </View>
  );

  const screens = {
    Wallet: <Wallet />,
    Receive: <Receive />,
    Send: <Send />,
    Activity: <Activity />,
    Security: <Security />,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        {screens[tab]}
      </ScrollView>
      <View style={styles.navigation}>
        {Object.keys(screens).map((name) => (
          <TouchableOpacity
            key={name}
            style={styles.navItem}
            onPress={() => setTab(name)}
          >
            <Text style={[
              styles.navText,
              tab === name && styles.navActive
            ]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#292929',
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  demo: { color: GOLD, fontSize: 10, fontWeight: 'bold' },
  content: { padding: 22, paddingBottom: 35 },
  eyebrow: { color: GOLD, fontSize: 11, letterSpacing: 2, marginTop: 10 },
  heading: { color: '#FFFFFF', fontSize: 29, fontWeight: 'bold', marginTop: 12, marginBottom: 22 },
  balanceCard: {
    backgroundColor: '#17140E', borderColor: '#725B2C',
    borderWidth: 1, borderRadius: 16, padding: 23, marginTop: 20,
  },
  muted: { color: '#999999', fontSize: 12, marginTop: 7 },
  balance: { color: '#FFFFFF', fontSize: 27, fontWeight: 'bold', marginVertical: 15 },
  balanceSmall: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginVertical: 12 },
  gold: { color: GOLD, fontSize: 12, fontWeight: 'bold', marginTop: 8 },
  section: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 15 },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1, backgroundColor: '#191919', borderRadius: 12,
    padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333',
  },
  actionIcon: { color: GOLD, fontSize: 25 },
  actionText: { color: '#FFFFFF', fontSize: 12, marginTop: 7 },
  panel: { backgroundColor: '#171717', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#383838' },
  receiveCode: { color: '#FFFFFF', fontSize: 19, fontWeight: 'bold', marginVertical: 22, textAlign: 'center' },
  warning: { color: '#C9A85A', fontSize: 12, lineHeight: 20, marginTop: 20 },
  label: { color: GOLD, fontSize: 11, marginTop: 25, marginBottom: 8 },
  input: {
    color: '#FFFFFF', backgroundColor: '#090909', padding: 16,
    borderRadius: 9, fontSize: 19, borderWidth: 1, borderColor: '#555',
  },
  primary: { backgroundColor: GOLD, padding: 17, borderRadius: 9, marginTop: 20, alignItems: 'center' },
  primaryText: { color: '#090909', fontWeight: 'bold', fontSize: 13 },
  transaction: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 17,
    borderBottomWidth: 1, borderBottomColor: '#292929',
  },
  transactionTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  transactionAmount: { fontSize: 12, fontWeight: 'bold' },
  securityItem: { color: '#FFFFFF', marginTop: 20, fontSize: 14 },
  navigation: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 15, backgroundColor: '#151515',
    borderTopWidth: 1, borderTopColor: '#333',
  },
  navItem: { alignItems: 'center', paddingHorizontal: 3 },
  navText: { color: '#888888', fontSize: 10 },
  navActive: { color: GOLD, fontWeight: 'bold' },
});
