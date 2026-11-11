import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, StatusBar,
  StyleSheet, Alert
} from 'react-native';

const GOLD = '#D9B45B';
const BG = '#080A0D';
const CARD = '#151920';

export default function App() {
  const [page, setPage] = useState('Setup');
  const [balance, setBalance] = useState(0.08431);
  const [amount, setAmount] = useState('');
  const [hidden, setHidden] = useState(false);
  const [history, setHistory] = useState([
    { name: 'Demo deposit', amount: 0.025, date: 'Sample activity' },
    { name: 'Coffee & company', amount: -0.0018, date: 'Sample activity' },
    { name: 'Demo deposit', amount: 0.06111, date: 'Sample activity' },
  ]);

  const btc = (n) => n.toFixed(8) + ' BTC';

  const sendDemo = () => {
    const value = Number(amount);

    if (!/^\d+(\.\d{1,8})?$/.test(amount.trim()) ||
      !Number.isFinite(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid BTC amount.');
      return;
    }

    if (value > balance) {
      Alert.alert('Insufficient balance', 'Your sample balance is too low.');
      return;
    }

    Alert.alert(
      'Review demo transaction',
      `Simulate ${btc(value)}? No Bitcoin will be sent.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm simulation',
          onPress: () => {
            setBalance(old => Number((old - value).toFixed(8)));
            setHistory(old => [{
              name: 'Simulated send',
              amount: -value,
              date: 'Local demo · Not sent'
            }, ...old]);
            setAmount('');
            setPage('Activity');
            Alert.alert('Demo complete', 'Sample balance updated. Nothing was transferred.');
          }
        }
      ]
    );
  };

  const Header = () => (
    <View style={s.header}>
      <View>
        <Text style={s.brand}>ZIDANE<Text style={{ color: GOLD }}> WALLET</Text></Text>
        <Text style={s.tagline}>YOUR DIGITAL PRACTICE SPACE</Text>
      </View>
      <View style={s.demoBadge}>
        <Text style={s.demoText}>● DEMO</Text>
      </View>
    </View>
  );

  const Button = ({ title, onPress, secondary }) => (
    <TouchableOpacity
      style={[s.button, secondary && s.secondaryButton]}
      onPress={onPress}
    >
      <Text style={[s.buttonText, secondary && { color: GOLD }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const Transaction = ({ item }) => (
    <View style={s.transaction}>
      <View style={s.transactionIcon}>
        <Text style={{ color: GOLD, fontSize: 20 }}>
          {item.amount > 0 ? '↓' : '↑'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.transactionName}>{item.name}</Text>
        <Text style={s.muted}>{item.date}</Text>
      </View>
      <Text style={{
        color: item.amount > 0 ? '#69D69A' : GOLD,
        fontWeight: 'bold'
      }}>
        {item.amount > 0 ? '+' : ''}{item.amount.toFixed(8)}
      </Text>
    </View>
  );

  const Home = () => (
    <>
      <View style={s.welcome}>
        <Text style={s.muted}>WELCOME TO YOUR WALLET</Text>
        <Text style={s.heading}>Your money, your control.</Text>
      </View>

      <View style={s.balanceCard}>
        <View style={s.cardTop}>
          <Text style={s.cardLabel}>TOTAL SAMPLE BALANCE</Text>
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Text style={s.gold}>{hidden ? 'SHOW' : 'HIDE'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.balance}>
          {hidden ? '••••••••' : btc(balance)}
        </Text>
        <Text style={s.cardFoot}>Practice balance · Not real funds</Text>
        <View style={s.cardLine} />
        <Text style={s.cardFoot}>BITCOIN · BTC</Text>
      </View>

      <Text style={s.sectionTitle}>Quick actions</Text>
      <View style={s.actionRow}>
        <TouchableOpacity style={s.action} onPress={() => setPage('Receive')}>
          <Text style={s.actionIcon}>↓</Text>
          <Text style={s.actionText}>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={() => setPage('Send')}>
          <Text style={s.actionIcon}>↑</Text>
          <Text style={s.actionText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={() => setPage('Activity')}>
          <Text style={s.actionIcon}>↗</Text>
          <Text style={s.actionText}>Activity</Text>
        </TouchableOpacity>
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recent activity</Text>
        <TouchableOpacity onPress={() => setPage('Activity')}>
          <Text style={s.gold}>VIEW ALL →</Text>
        </TouchableOpacity>
      </View>
      {history.slice(0, 3).map((item, i) =>
        <Transaction key={i} item={item} />
      )}
    </>
  );

  const Receive = () => (
    <>
      <Text style={s.heading}>Receive</Text>
      <Text style={s.muted}>Explore how receiving works.</Text>
      <View style={s.panel}>
        <Text style={s.gold}>DEMO RECEIVING LABEL</Text>
        <Text style={s.receiveCode}>ZIDANE-DEMO-ONLY</Text>
        <Text style={s.muted}>
          This is not a real Bitcoin address.
        </Text>
      </View>
      <Text style={s.warning}>
        No real deposits, blockchain connection or QR code are supported.
      </Text>
    </>
  );

  const Send = () => (
    <>
      <Text style={s.heading}>Send</Text>
      <Text style={s.muted}>Practice a simulated transaction.</Text>
      <View style={s.panel}>
        <Text style={s.gold}>AVAILABLE SAMPLE BALANCE</Text>
        <Text style={s.balanceSmall}>{btc(balance)}</Text>
        <Text style={s.fieldLabel}>AMOUNT IN BTC</Text>
        <TextInput
          style={s.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00000000"
          placeholderTextColor="#777"
          keyboardType="decimal-pad"
        />
        <Button title="REVIEW DEMO SEND" onPress={sendDemo} />
        <Text style={s.muted}>No Bitcoin will leave this device.</Text>
      </View>
    </>
  );

  const Activity = () => (
    <>
      <Text style={s.heading}>Activity</Text>
      <Text style={s.muted}>Your sample transaction history</Text>
      {history.map((item, i) =>
        <Transaction key={i} item={item} />
      )}
      <Text style={s.warning}>All records are fictional demo activity.</Text>
    </>
  );

  const Security = () => (
    <>
      <Text style={s.heading}>Security center</Text>
      <Text style={s.muted}>Understand the demo safety limits.</Text>
      <View style={s.panel}>
        {[
          'No private keys stored',
          'No seed phrase requested',
          'No blockchain connection',
          'No real Bitcoin transfers',
          'No real funds held'
        ].map((item, i) => (
          <View style={s.securityRow} key={i}>
            <Text style={s.check}>✓</Text>
            <Text style={s.securityText}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={s.warning}>
        This is a practice application, not a production cryptocurrency wallet.
      </Text>
      <Button
        title="RESET DEMO BALANCE"
        secondary
        onPress={() => Alert.alert(
          'Reset demo?',
          'Restore the original sample balance and activity?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              onPress: () => {
                setBalance(0.08431);
                setHistory([
                  { name: 'Demo deposit', amount: 0.025, date: 'Sample activity' },
                  { name: 'Coffee & company', amount: -0.0018, date: 'Sample activity' },
                  { name: 'Demo deposit', amount: 0.06111, date: 'Sample activity' }
                ]);
                setPage('Home');
              }
            }
          ]
        )}
      />
    </>
  );

  const pages = {
    Home: <Home />,
    Receive: <Receive />,
    Send: <Send />,
    Activity: <Activity />,
    Security: <Security />
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Header />
      <ScrollView contentContainerStyle={s.content}>
        {pages[page]}
      </ScrollView>
      <View style={s.navigation}>
        {[
          ['Home', '⌂'],
          ['Receive', '↓'],
          ['Send', '↑'],
          ['Activity', '↗'],
          ['Security', '◇']
        ].map(([name, icon]) => (
          <TouchableOpacity
            key={name}
            style={s.navItem}
            onPress={() => setPage(name)}
          >
            <Text style={[s.navIcon, page === name && s.active]}>{icon}</Text>
            <Text style={[s.navText, page === name && s.active]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    padding: 20, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderBottomWidth: 1, borderColor: '#242932'
  },
  brand: { color: '#FFF', fontSize: 19, fontWeight: '900', letterSpacing: 1 },
  tagline: { color: '#858B94', fontSize: 8, letterSpacing: 2, marginTop: 5 },
  demoBadge: { borderWidth: 1, borderColor: '#76602F', padding: 8, borderRadius: 20 },
  demoText: { color: GOLD, fontSize: 10, fontWeight: 'bold' },
  content: { padding: 20, paddingBottom: 35 },
  welcome: { marginTop: 10, marginBottom: 20 },
  heading: { color: '#FFF', fontSize: 29, fontWeight: 'bold', marginTop: 12, marginBottom: 10 },
  muted: { color: '#969DA8', fontSize: 12, lineHeight: 19, marginTop: 5 },
  gold: { color: GOLD, fontSize: 11, fontWeight: 'bold' },
  balanceCard: {
    backgroundColor: '#19170F', borderWidth: 1, borderColor: '#786132',
    borderRadius: 18, padding: 22, marginBottom: 28
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: '#B6B1A5', fontSize: 10, letterSpacing: 1 },
  balance: { color: '#FFF', fontSize: 27, fontWeight: 'bold', marginTop: 22 },
  cardFoot: { color: '#A39B88', fontSize: 11, marginTop: 10 },
  cardLine: { height: 1, backgroundColor: '#51452D', marginTop: 20 },
  sectionTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold', marginBottom: 15 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  action: {
    flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 17,
    alignItems: 'center', borderWidth: 1, borderColor: '#29303A'
  },
  actionIcon: { color: GOLD, fontSize: 25 },
  actionText: { color: '#FFF', fontSize: 11, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transaction: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 16, borderBottomWidth: 1, borderColor: '#252B34'
  },
  transactionIcon: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#222019',
    alignItems: 'center', justifyContent: 'center'
  },
  transactionName: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  panel: {
    backgroundColor: CARD, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#303743', marginTop: 22
  },
  receiveCode: { color: '#FFF', fontSize: 19, fontWeight: 'bold', marginVertical: 24, textAlign: 'center' },
  warning: { color: GOLD, fontSize: 12, lineHeight: 20, marginTop: 20 },
  balanceSmall: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  fieldLabel: { color: GOLD, fontSize: 11, marginTop: 25, marginBottom: 9 },
  input: {
    backgroundColor: BG, color: '#FFF', padding: 16, borderRadius: 10,
    borderWidth: 1, borderColor: '#3B424D', fontSize: 18
  },
  button: {
    backgroundColor: GOLD, padding: 17, borderRadius: 10,
    alignItems: 'center', marginTop: 20
  },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: GOLD },
  buttonText: { color: BG, fontWeight: 'bold', fontSize: 12 },
  securityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  check: { color: '#69D69A', fontSize: 17, marginRight: 12 },
  securityText: { color: '#FFF', fontSize: 13 },
  navigation: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#13171D', paddingVertical: 13,
    borderTopWidth: 1, borderColor: '#303743'
  },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { color: '#858B94', fontSize: 20 },
  navText: { color: '#858B94', fontSize: 9, marginTop: 4 },
  active: { color: GOLD, fontWeight: 'bold' }
});
