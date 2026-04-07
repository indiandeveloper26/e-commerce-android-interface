import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, SafeAreaView, StatusBar, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import api from '../componet/axios';
import url from '../componet/url';

export default function OrdersScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem("id");
            if (!userId) {
                setError("Please login to see orders");
                return;
            }
            const res = await api.get(`/api/order/orderdata/${userId}`);
            if (res.data.success) {
                setOrders(res.data.data.orders || []);

                console.log('orderdata', res)
            }
        } catch (err) {
            setError("Could not load history");
        } finally {
            setLoading(false);
        }
    };

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View style={styles.orderInfo}>
                    <View style={styles.packageBox}>
                        <Feather name="package" size={18} color="#F54D27" />
                    </View>
                    <View>
                        <Text style={styles.label}>ORDER ID</Text>
                        <Text style={styles.orderIdText}>#{item._id.slice(-8).toUpperCase()}</Text>
                    </View>
                </View>

                <View style={[styles.statusBadge,
                { backgroundColor: item.status === "Paid" ? "#ecfdf5" : "#fffbeb" }]}>
                    <Text style={[styles.statusText,
                    { color: item.status === "Paid" ? "#10b981" : "#f59e0b" }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.productsList}>
                {item.products.map((prod, idx) => (
                    <View key={idx} style={styles.productRow}>
                        <Image
                            source={{ uri: `${url}/${prod.product?.images?.[0]}` }}
                            style={styles.productImg}
                        />
                        <View style={styles.productDetails}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {prod.product?.name || "Premium Item"}
                            </Text>
                            <Text style={styles.productMeta}>
                                Qty: {prod.quantity} • ₹{prod.price}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.label}>TOTAL INVESTMENT</Text>
                    <Text style={styles.totalPrice}>₹{item.totalPrice}</Text>
                </View>
                <TouchableOpacity style={styles.detailBtn}>
                    <Feather name="chevron-right" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.dateBar}>
                <Feather name="clock" size={10} color="#9ca3af" />
                <Text style={styles.dateText}>
                    BOOKED {new Date(item.createdAt).toLocaleDateString('en-GB')}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F54D27" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* --- CUSTOM RESPONSIVE HEADER WITH BACK BUTTON --- */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backCircle}
                >
                    <Feather name="arrow-left" size={22} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.subTitle}>YOUR HISTORY</Text>
                    <Text style={styles.mainTitle}>My Orders<Text style={{ color: '#F54D27' }}>.</Text></Text>
                </View>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{orders.length}</Text>
                </View>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="shopping-bag" size={50} color="#d1d5db" />
                    <Text style={styles.emptyText}>{error || "No Orders Yet"}</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listPadding}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', marginTop: 11 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header Styling
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        paddingBottom: 20,
        gap: 15
    },
    backCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    headerTitleContainer: { flex: 1 },
    subTitle: { fontSize: 9, fontWeight: '900', color: '#F54D27', letterSpacing: 2 },
    mainTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },

    countBadge: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    countText: { color: '#fff', fontSize: 12, fontWeight: '900' },

    // Card Styling
    listPadding: { paddingHorizontal: 20, paddingBottom: 40 },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        marginBottom: 20,
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    orderInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    packageBox: { backgroundColor: '#F3F4F6', padding: 8, borderRadius: 12 },
    label: { fontSize: 8, fontWeight: '900', color: '#9ca3af', letterSpacing: 0.5 },
    orderIdText: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
    statusText: { fontSize: 9, fontWeight: '900' },

    productsList: { marginBottom: 15 },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    productImg: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#F3F4F6' },
    productDetails: { flex: 1 },
    productName: { fontSize: 12, fontWeight: '900', color: '#111827' },
    productMeta: { fontSize: 10, color: '#9ca3af' },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderStyle: 'dashed'
    },
    totalPrice: { fontSize: 20, fontWeight: '900', color: '#F54D27', fontStyle: 'italic' },
    detailBtn: { backgroundColor: '#111827', padding: 10, borderRadius: 12 },

    dateBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 },
    dateText: { fontSize: 9, fontWeight: '900', color: '#d1d5db' },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 15, fontSize: 14, fontWeight: '900', color: '#d1d5db' }
});