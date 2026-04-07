import React, { useEffect, useState } from "react";
import {
    View, Text, Image, StyleSheet, TouchableOpacity,
    ActivityIndicator, SafeAreaView, FlatList, LayoutAnimation, Platform, UIManager, StatusBar,
    Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import api from "../componet/axios";
import url from "../componet/url";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CartScreen({ navigation }) {
    const insets = useSafeAreaInsets(); // Notch aur Bottom bar handle karne ke liye
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserId = async () => {
            const id = await AsyncStorage.getItem("id");
            if (id) setUserId(id);
            else setLoading(false);
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (userId) fetchCart();
    }, [userId]);

    const fetchCart = async () => {
        try {
            const res = await api.post("/api/cart/get", { userId });
            setCart(res.data.cart || []);
        } catch (err) {
            console.log("Cart fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await api.delete(`/api/cart/delete/${itemId}`);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCart(cart.filter((item) => item._id !== itemId));
        } catch (err) {
            alert("Delete failed");
        }
    };


    const checkout = async (data) => {
        try {
            // अगर 'data' एक JSON string है, तो इसे एक बार पार्स करें


            // अब आप सीधे parsedData का उपयोग कर सकते हैं
            console.log(data.product.slug);


            navigation.navigate('productd', { slug: data.product.slug });

        } catch (error) {
            console.error("Parsing error:", error);
        }
    }

    const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const totalPrice = cart.reduce((sum, i) => sum + ((i.product?.price || 0) * (i.quantity || 0)), 0);

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color="#F54D27" /></View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* --- HEADER WITH BACK BUTTON --- */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Feather name="chevron-left" size={28} color="#111827" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Cart<Text style={{ color: '#F54D27' }}>.</Text></Text>
                </View>
                <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{totalItems} ITEMS</Text>
                </View>
            </View>

            <FlatList
                data={cart}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="shopping-bag" size={60} color="#f3f4f6" />
                        <Text style={styles.emptyText}>YOUR BAG IS EMPTY</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.shopNowText}>START SHOPPING</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => (

                    <TouchableOpacity onPress={() => checkout(item)}>


                        <View style={styles.cartCard} >



                            <Image
                                source={{ uri: `${url}/${item.product?.images?.[0]}` }}
                                style={styles.productImg}
                            />

                            <View style={styles.details}>
                                <Text style={styles.prodName} numberOfLines={1}>{item.product?.name}</Text>
                                <Text style={styles.prodPrice}>₹{item.product?.price}</Text>

                                <View style={styles.qtyContainer}>
                                    <TouchableOpacity style={styles.qtyBtn}><Text style={styles.qtySymbol}>-</Text></TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity style={styles.qtyBtn}><Text style={[styles.qtySymbol, { color: '#F54D27' }]}>+</Text></TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.rightActions}>
                                <Text style={styles.subtotal}>₹{item.product?.price * item.quantity}</Text>
                                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                                    <Feather name="trash-2" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </TouchableOpacity>
                )}
            />

            {/* --- SUMMARY PANEL WITH SAFE AREA --- */}
            {cart.length > 0 && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                        <Text style={styles.totalAmount}>₹{totalPrice}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={() => navigation.navigate('Checkout')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.checkoutText}>SECURE CHECKOUT</Text>
                        <Feather name="arrow-right" size={20} color="#fff" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingBottom: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
    },
    headerTitle: { fontSize: 30, fontWeight: "900", fontStyle: 'italic', color: '#111827' },
    itemBadge: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    itemBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff' },

    cartCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        alignItems: 'center',
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    productImg: { width: 85, height: 85, borderRadius: 18, backgroundColor: '#f9fafb' },
    details: { flex: 1, paddingHorizontal: 12 },
    prodName: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 2 },
    prodPrice: { color: '#F54D27', fontWeight: '800', fontSize: 14 },

    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        width: 90,
        justifyContent: 'space-around',
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    qtyBtn: { width: 25, alignItems: 'center' },
    qtySymbol: { fontSize: 18, fontWeight: 'bold' },
    qtyText: { fontWeight: '900', fontSize: 14 },

    rightActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 75 },
    subtotal: { fontWeight: '900', fontSize: 15, color: '#111827' },
    deleteBtn: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 10 },

    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        paddingTop: 20,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        elevation: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    totalLabel: { fontWeight: '900', fontSize: 12, color: '#9ca3af', letterSpacing: 1 },
    totalAmount: { fontSize: 26, fontWeight: '900', color: '#111827' },
    checkoutBtn: {
        backgroundColor: '#111827',
        height: 60,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    checkoutText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },

    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontWeight: '900', fontSize: 16, color: '#d1d5db', marginTop: 10 },
    shopNowText: { color: '#F54D27', fontWeight: '900', marginTop: 15, fontSize: 14 }
});