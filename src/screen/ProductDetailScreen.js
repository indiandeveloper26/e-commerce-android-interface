import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity,
    StyleSheet, Dimensions, ActivityIndicator, SafeAreaView, Alert, StatusBar, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import { fetchProducts } from '../redux/productdata';
import { useGetProductsQuery } from '../redux/productslice';
import api from '../componet/axios';
import { useNotify } from "../redux/contextapi";

const { width, height } = Dimensions.get('window');

export default function ProductDetailScreen({ route }) {
    const navigation = useNavigation();
    const { slug } = route.params;
    const dispatch = useDispatch();
    const { showNotify } = useNotify();

    const [userId, setUserId] = useState("");
    const [activeImage, setActiveImage] = useState(0);
    const [adding, setAdding] = useState(false);
    const [product, setProduct] = useState(null);

    const { isLoggedIn } = useSelector((state) => state.auth);
    const { data: apiResponse, isLoading } = useGetProductsQuery();

    useEffect(() => {
        const getUserId = async () => {
            const id = await AsyncStorage.getItem("id");
            if (id) setUserId(id);
        };
        getUserId();
    }, []);

    useEffect(() => {
        if (apiResponse?.data?.length > 0) {
            const found = apiResponse.data.find((p) => p.slug === slug);
            if (found) setProduct(found);
        }
    }, [apiResponse, slug]);



    const buy = async () => {

        if (!isLoggedIn) {
            showNotify("Please login first!", "error");
            return;
        }

        try {
            AsyncStorage.setItem("buyNowProduct", JSON.stringify(product));
            navigation.navigate('Checkout');
        } catch (error) {
            console.log('errro ', error)
        }


    }

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            showNotify("Please login first!", "error");
            return;
        }
        setAdding(true);
        try {
            await api.post("/api/cart/add", {
                userId,
                productId: product._id
            });
            showNotify("Added to cart successfully!", "success");
        } catch (err) {
            showNotify(err.response?.data?.message || "Something went wrong", "error");
        } finally {
            setAdding(false);
        }
    };

    if (isLoading || !product) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F54D27" />
            </View>
        );
    }

    return (
        <View style={styles.mainWrapper}>
            {/* Background color ko status bar tak le jaane ke liye */}
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <SafeAreaView style={styles.container}>
                {/* Header: Responsive with Notch padding */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
                        <Feather name="arrow-left" size={22} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTag}>PRODUCT DETAILS</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('cart')} style={styles.iconCircle}>
                        <Feather name="shopping-bag" size={22} color="#111827" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Image Section: Height based on Screen Ratio */}
                    <View style={styles.imageSection}>
                        <Image
                            source={{ uri: `https://eccomerce-wine.vercel.app/${product.images?.[activeImage]}` }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />

                        {/* Rating Badge */}
                        <View style={styles.ratingBadge}>
                            <Feather name="star" size={12} color="#F54D27" style={{ marginRight: 4 }} />
                            <Text style={styles.ratingText}>4.9 (120 REVIEWS)</Text>
                        </View>

                        {/* Thumbnails Overlay */}
                        <View style={styles.thumbContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {product.images?.map((img, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setActiveImage(idx)}
                                        style={[
                                            styles.thumbItem,
                                            activeImage === idx && styles.activeThumb
                                        ]}
                                    >
                                        <Image source={{ uri: `https://eccomerce-wine.vercel.app/${img}` }} style={styles.thumbImg} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.category}>{product.category?.toUpperCase()}</Text>
                        <Text style={styles.name}>{product.name}<Text style={{ color: '#F54D27' }}>.</Text></Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.price}>₹{product.price}</Text>
                            {product.discountPrice && (
                                <Text style={styles.oldPrice}>₹{product.discountPrice}</Text>
                            )}
                            <View style={styles.stockBadge}>
                                <Text style={styles.stockText}>IN STOCK</Text>
                            </View>
                        </View>

                        <Text style={styles.description}>
                            {product.description || "Premium masterclass in design and materials."}
                        </Text>

                        <View style={styles.trustRow}>
                            <TrustItem icon="truck" label="FAST DELIVERY" />
                            <TrustItem icon="shield" label="ORIGINAL" />
                            <TrustItem icon="zap" label="FLASH SALE" />
                        </View>
                    </View>
                </ScrollView>

                {/* Sticky Bottom Bar - Fixed at the very bottom */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.cartBtn, adding && { opacity: 0.7 }]}
                        onPress={handleAddToCart}
                        disabled={adding}
                    >
                        {adding ? <ActivityIndicator size="small" color="#fff" /> : (
                            <>
                                <Feather name="shopping-bag" size={18} color="#fff" />
                                <Text style={styles.cartBtnText}>ADD TO CART</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => {
                            buy()
                        }}
                    >
                        <Text style={styles.buyBtnText}>BUY NOW</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const TrustItem = ({ icon, label }) => (
    <View style={styles.trustItem}>
        <View style={styles.trustIconBox}>
            <Feather name={icon} size={16} color="#9ca3af" />
        </View>
        <Text style={styles.trustText}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    mainWrapper: { flex: 1, backgroundColor: '#fff', marginTop: 15 },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        zIndex: 10
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTag: { fontSize: 10, fontWeight: '900', color: '#9ca3af', letterSpacing: 2 },

    imageSection: { position: 'relative', width: width, height: height * 0.45 }, // Responsive height
    mainImage: { width: '100%', height: '100%' },

    ratingBadge: {
        position: 'absolute',
        top: 15,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2
    },
    ratingText: { fontSize: 9, fontWeight: '900', color: '#111827' },

    thumbContainer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        right: 0
    },
    thumbItem: {
        width: 55,
        height: 55,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        marginRight: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 3
    },
    activeThumb: { borderColor: '#F54D27' },
    thumbImg: { width: '100%', height: '100%' },

    infoContainer: { padding: 20, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -20 },
    category: { color: '#F54D27', fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 5 },
    name: { fontSize: 26, fontWeight: '900', color: '#111827', marginBottom: 10 },

    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    price: { fontSize: 28, fontWeight: '900', color: '#111827' },
    oldPrice: { fontSize: 16, color: '#d1d5db', textDecorationLine: 'line-through', marginLeft: 10 },
    stockBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 12 },
    stockText: { color: '#16a34a', fontSize: 9, fontWeight: '900' },

    description: { fontSize: 14, color: '#6b7280', lineHeight: 22 },

    trustRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
        paddingTop: 20,
        borderTopWidth: 1,
        borderColor: '#f3f4f6'
    },
    trustItem: { alignItems: 'center', flex: 1 },
    trustIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f9fafb', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    trustText: { fontSize: 8, fontWeight: '900', color: '#9ca3af' },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15, // iOS Home bar padding
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#f3f4f6',
        elevation: 10
    },
    cartBtn: {
        flex: 1.2,
        backgroundColor: '#111827',
        height: 55,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    cartBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
    buyBtn: {
        flex: 1,
        backgroundColor: '#F54D27',
        height: 55,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 }
});