import React, { useMemo } from "react";
import { View, Image, StyleSheet, Dimensions, Text, ActivityIndicator } from "react-native";
import Swiper from "react-native-swiper";
import { useGetProductsQuery } from "../redux/productslice";
// Optional: Overlay ke liye

const { width } = Dimensions.get("window");

export default function ProductSlider() {
    const { data: apiResponse, isLoading } = useGetProductsQuery();

    const products = useMemo(() => {
        if (apiResponse?.success && Array.isArray(apiResponse.data)) {
            // Sirf wahi products le rahe hain jinme image ho
            return apiResponse.data.filter(p => p.images).slice(0, 5);
        }
        return [];
    }, [apiResponse]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator color="#FF5722" />
            </View>
        );
    }

    if (products.length === 0) return null;

    return (
        <View style={styles.container}>
            <Swiper
                autoplay
                autoplayTimeout={4}
                showsPagination={true}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.pagination}
                removeClippedSubviews={false} // Android glitch fix
            >
                {products.map((item, index) => (
                    <View key={item._id || index} style={styles.slide}>
                        <View style={styles.card}>
                            <Image
                                source={{
                                    uri: `https://eccomerce-wine.vercel.app/${item.images?.[0] || item.images}`
                                }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                            {/* Text Overlay - optional styling */}
                            <View style={styles.textOverlay}>
                                <Text style={styles.promoTag}>New Arrival</Text>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </Swiper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 220,
        marginVertical: 15,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    slide: {
        flex: 1,
        paddingHorizontal: 20, // Sides se gap taaki card look aaye
    },
    card: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 5,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.2)', // Halka dark tint niche
    },
    promoTag: {
        color: '#FF5722',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        backgroundColor: '#FFF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
        marginBottom: 4
    },
    productName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    dot: {
        backgroundColor: 'rgba(255,255,255,0.4)',
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    activeDot: {
        backgroundColor: '#FFF',
        width: 20, // Active dot thoda lamba (capsule style)
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    pagination: {
        bottom: 15, // Dots ki position image ke andar
    }
});