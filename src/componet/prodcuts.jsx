import React, { useState, useMemo, lazy, Suspense } from 'react';
import {
    View, Text, StyleSheet, TextInput, FlatList,
    Image, TouchableOpacity, ActivityIndicator, Dimensions,
    StatusBar, SafeAreaView, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetProductsQuery } from '../redux/productslice';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Productslide = lazy(() => import('./slider'));

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

export default function ProductsScreen() {
    const [search, setSearch] = useState("");
    const { data: apiResponse, isLoading, refetch } = useGetProductsQuery();
    const navigation = useNavigation();

    const products = useMemo(() => {
        if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
            return apiResponse.data;
        }
        return [];
    }, [apiResponse]);

    const filteredData = useMemo(() => {
        if (!products.length) return [];
        const searchLower = search.toLowerCase();
        return products.filter(p => {
            const productName = p.name ? String(p.name).toLowerCase() : "";
            const productCategory = p.category ? String(p.category).toLowerCase() : "";
            return productName.includes(searchLower) || productCategory.includes(searchLower);
        });
    }, [search, products]);

    const Header = () => (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <Text style={styles.heroText}>Curated{"\n"}<Text style={styles.highlight}>Collections.</Text></Text>
                <TouchableOpacity style={styles.cartBtn}>
                    <Icon name="bag-handle-outline" size={24} color="#1a1a1a" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search-outline" size={20} color="#999" />
                    <TextInput
                        placeholder="Search premium items..."
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Icon name="options-outline" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            <Suspense fallback={
                <View style={styles.sliderPlaceholder}>
                    <ActivityIndicator color="#FF5722" />
                </View>
            }>
                <Productslide />
            </Suspense>

            <Text style={styles.sectionTitle}>Recently Added</Text>
        </View>
    );

    const ProductCard = ({ item }) => {
        const ratingValue = useMemo(() => {
            if (typeof item.ratings === 'object' && item.ratings !== null) {
                return item.ratings.average || '4.0';
            }
            return item.ratings || '4.0';
        }, [item.ratings]);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate("productd", { slug: item?.slug })}
            >
                <View style={styles.imageBox}>
                    <Image
                        source={{ uri: `https://eccomerce-wine.vercel.app/${item.images?.[0] || item.images}` }}
                        style={styles.img}
                        resizeMode="cover"
                    />
                    <TouchableOpacity style={styles.wishlistBtn}>
                        <Icon name="heart-outline" size={16} color="#FF5722" />
                    </TouchableOpacity>
                </View>
                <View style={styles.info}>
                    <Text style={styles.category}>{item.category || "PREMIUM"}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>₹{item.price || '0'}</Text>
                        <View style={styles.rating}>
                            <Icon name="star" size={10} color="#FFB800" />
                            <Text style={styles.ratingText}>{String(ratingValue)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading && products.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FF5722" /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <FlatList
                data={filteredData}
                numColumns={2}
                keyExtractor={(item, index) => (item._id ? String(item._id) : String(index))}
                ListHeaderComponent={Header}
                renderItem={({ item }) => <ProductCard item={item} />}
                columnWrapperStyle={styles.row}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FF5722" />}
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Icon name="cube-outline" size={50} color="#DDD" />
                        <Text style={{ color: '#999', marginTop: 10 }}>No products found.</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
    header: { padding: 20 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    heroText: { color: '#1a1a1a', fontSize: 30, fontWeight: '800', lineHeight: 36 },
    highlight: { color: '#FF5722' },
    cartBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 10 },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7',
        height: 52, borderRadius: 16, paddingHorizontal: 15,
    },
    filterBtn: { width: 52, height: 52, backgroundColor: '#1a1a1a', borderRadius: 16, marginLeft: 12, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, color: '#000', marginLeft: 10, fontSize: 15, fontWeight: '500' },

    sliderPlaceholder: { height: 200, backgroundColor: '#F9F9F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 5 },

    row: { justifyContent: 'space-between', paddingHorizontal: 18 },
    card: {
        width: CARD_WIDTH,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    imageBox: { width: '100%', aspectRatio: 0.9, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F5F5F5' },
    img: { width: '100%', height: '100%' },
    wishlistBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFF', padding: 6, borderRadius: 10 },

    info: { padding: 8 },
    category: { color: '#999', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    name: { color: '#1a1a1a', fontSize: 14, fontWeight: '700', marginTop: 2 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
    price: { color: '#1a1a1a', fontSize: 16, fontWeight: '800' },
    rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F0', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    ratingText: { color: '#FFB800', fontSize: 11, fontWeight: '700', marginLeft: 3 }
});