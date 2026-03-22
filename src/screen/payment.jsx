// import React, { useEffect, useState } from 'react';
// import {
//     View, Text, ScrollView, TouchableOpacity,
//     StyleSheet, ActivityIndicator, SafeAreaView, Alert
// } from 'react-native';
// import RazorpayCheckout from 'react-native-razorpay'; // Native SDK
// import Feather from 'react-native-vector-icons/Feather';
// import api from '../componet/axios'; // Apka axios instance

// export default function PaymentScreen({ route, navigation }) {
//     // orderId params se le rahe hain (Checkout screen se aayega)
//     const { orderId } = route.params;
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchOrderDetails();
//     }, [orderId]);

//     const fetchOrderDetails = async () => {
//         try {
//             const { data } = await api.get(`/api/order/${orderId}`);
//             setOrder(data.order);
//         } catch (err) {
//             Alert.alert("Error", "Failed to load order details");
//             navigation.goBack();
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handlePayment = async () => {
//         try {
//             // 1. Backend se Razorpay Order ID create karwana
//             const paymentRes = await api.post("/api/pymnet/crate", {
//                 orderId: order._id,
//                 amount: order.totalPrice * 100,
//             });

//             const paymentData = paymentRes.data;

//             const options = {
//                 description: `Payment for Order #${order._id.slice(-6)}`,
//                 image: 'https://your-logo-url.com/logo.png',
//                 currency: 'INR',
//                 key: "rzp_test_RqlfH5s7HXQ2nY",
//                 amount: paymentData.amount,
//                 name: 'My Shop',
//                 order_id: paymentData.id,
//                 prefill: {
//                     email: order.userEmail || '',
//                     contact: '',
//                     name: order.userName || ''
//                 },
//                 theme: { color: '#F54D27' }
//             };

//             // 3. Razorpay Checkout Open karna
//             RazorpayCheckout.open(options).then(async (razorpayResponse) => { // Variable ka naam badal diya (data -> razorpayResponse)
//                 try {
//                     // API response ko 'res' naam do, 'data' nahi
//                     const res = await api.post(`/api/order/${order._id}/pay`, {
//                         razorpay_payment_id: razorpayResponse.razorpay_payment_id,
//                         razorpay_order_id: razorpayResponse.razorpay_order_id,
//                         razorpay_signature: razorpayResponse.razorpay_signature,
//                     });

//                     Alert.alert("Success", "Payment Successful!");
//                     navigation.navigate('orders');

//                     console.log('Server Response:', res.data);
//                 } catch (err) {
//                     console.log('Verification Error:', err);
//                     Alert.alert("Verification Failed", "Contact support if amount was deducted.");
//                 }
//             }).catch((error) => {
//                 console.log('Razorpay Error:', error.code, error.description);
//                 Alert.alert("Payment Cancelled", `Error: ${error.description}`);
//             });

//         } catch (err) {
//             Alert.alert("Error", "Could not initiate payment");
//         }
//     };

//     if (loading) return (
//         <View style={styles.center}>
//             <ActivityIndicator size="large" color="#F54D27" />
//         </View>
//     );

//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView contentContainerStyle={styles.scrollContent}>

//                 {/* Status Header */}
//                 <View style={styles.header}>
//                     <View style={styles.statusBadge}>
//                         <Feather name="shield" size={12} color="#10b981" />
//                         <Text style={styles.statusText}>SECURE ORDER GENERATED</Text>
//                     </View>
//                     <Text style={styles.title}>Finalize Payment</Text>
//                     <Text style={styles.orderIdSub}>Order ID: #{order._id}</Text>
//                 </View>

//                 {/* Items Breakdown Card */}
//                 <View style={styles.mainCard}>
//                     <View style={styles.cardSection}>
//                         <View style={styles.sectionLabelRow}>
//                             <Feather name="package" size={16} color="#9ca3af" />
//                             <Text style={styles.sectionLabel}>YOUR PACKAGE</Text>
//                         </View>

//                         {order.products.map((item, idx) => (
//                             <View key={idx} style={styles.itemRow}>
//                                 <View>
//                                     <Text style={styles.itemName}>{item.product.name}</Text>
//                                     <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
//                                 </View>
//                                 <Text style={styles.itemPrice}>₹{item.price}</Text>
//                             </View>
//                         ))}
//                     </View>

//                     {/* Summary Section */}
//                     <View style={styles.summarySection}>
//                         <View style={styles.priceContainer}>
//                             <View>
//                                 <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
//                                 <Text style={styles.totalPrice}>₹{order.totalPrice}</Text>
//                             </View>
//                             <View style={styles.methodBadge}>
//                                 <Text style={styles.methodText}>{order.paymentMethod}</Text>
//                             </View>
//                         </View>

//                         {order.paymentMethod === "Online" ? (
//                             <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
//                                 <Feather name="credit-card" size={20} color="#fff" />
//                                 <Text style={styles.payBtnText}>PAY WITH RAZORPAY</Text>
//                                 <Feather name="chevron-right" size={20} color="#fff" />
//                             </TouchableOpacity>
//                         ) : (
//                             <View style={styles.codBadge}>
//                                 <Text style={styles.codText}>Ready to Ship! Pay on Delivery.</Text>
//                             </View>
//                         )}

//                         <View style={styles.lockRow}>
//                             <Feather name="lock" size={10} color="#9ca3af" />
//                             <Text style={styles.lockText}>256-BIT ENCRYPTED SECURE TRANSACTION</Text>
//                         </View>
//                     </View>
//                 </View>

//                 {/* Shipping Preview */}
//                 <View style={styles.shippingBox}>
//                     <View style={styles.shippingIconBox}>
//                         <Feather name="map-pin" size={18} color="#9ca3af" />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                         <Text style={styles.shippingLabel}>SHIPPING TO</Text>
//                         <Text style={styles.shippingAddress}>{order.address}</Text>
//                     </View>
//                 </View>

//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F9FAFB' },
//     center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     scrollContent: { padding: 20 },

//     header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
//     statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
//     statusText: { fontSize: 9, fontWeight: '900', color: '#10b981', letterSpacing: 1 },
//     title: { fontSize: 32, fontWeight: '900', fontStyle: 'italic', color: '#111827', textTransform: 'uppercase' },
//     orderIdSub: { fontSize: 12, color: '#9ca3af', marginTop: 5 },

//     mainCard: { backgroundColor: '#fff', borderRadius: 35, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
//     cardSection: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', borderStyle: 'dashed' },
//     sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, opacity: 0.5 },
//     sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
//     itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
//     itemName: { fontSize: 14, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase' },
//     itemQty: { fontSize: 12, color: '#9ca3af' },
//     itemPrice: { fontSize: 14, fontWeight: 'bold' },

//     summarySection: { padding: 25, backgroundColor: '#F9FAFB' },
//     priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 },
//     totalLabel: { fontSize: 9, fontWeight: '900', color: '#9ca3af', letterSpacing: 1 },
//     totalPrice: { fontSize: 36, fontWeight: '900', color: '#F54D27', fontStyle: 'italic' },
//     methodBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, elevation: 1 },
//     methodText: { fontSize: 10, fontWeight: 'bold' },

//     payBtn: {
//         backgroundColor: '#111827',
//         height: 65,
//         borderRadius: 22,
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         gap: 12,
//         shadowColor: "#000",
//         shadowOpacity: 0.2,
//         shadowRadius: 10,
//         elevation: 5
//     },
//     payBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },

//     codBadge: { backgroundColor: '#ecfdf5', padding: 20, borderRadius: 22, borderWidth: 1, borderColor: '#10b981', alignItems: 'center' },
//     codText: { color: '#10b981', fontWeight: '900', fontStyle: 'italic' },

//     lockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, opacity: 0.3 },
//     lockText: { fontSize: 8, fontWeight: '900' },

//     shippingBox: { marginTop: 20, padding: 20, borderRadius: 25, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', gap: 15 },
//     shippingIconBox: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
//     shippingLabel: { fontSize: 9, fontWeight: '900', color: '#9ca3af', marginBottom: 4 },
//     shippingAddress: { fontSize: 12, fontWeight: '500', color: '#4B5563', lineHeight: 18 }
// });








import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, SafeAreaView, Alert
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Feather from 'react-native-vector-icons/Feather';
import api from '../componet/axios';
import { useSelector } from 'react-redux';
import { useNotify } from '../redux/contextapi';

export default function PaymentScreen({ route, navigation }) {
    // Destructure orderId from route params
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useSelector((state) => state.auth);
    // Safe check for userId
    const userid = user?.data?.userId || user?._id


    console.log('useridd', userid)

    const { showNotify } = useNotify();


    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/api/order/${orderId}`);
                setOrder(data.order);
            } catch (err) {

                showNotify("Error", "Failed to load order details");

            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId]); // Only fetch when orderId changes

    const handlePayment = async () => {
        console.log('ordre', order, 'userid', userid)


        if (!order || !userid) {

            showNotify("ErrorSession expired. Please log in again");
            return;
        }

        try {
            const paymentRes = await api.post("/api/pymnet/crate", {
                orderId: order._id,
                amount: order.totalPrice * 100,
            });

            const paymentData = paymentRes.data;

            const options = {
                key: "rzp_test_RqlfH5s7HXQ2nY",
                amount: paymentData.amount,
                currency: "INR",
                name: "My Shop",
                description: `Order #${order._id.slice(-6)}`,
                order_id: paymentData.id,
                prefill: {
                    name: order.userName || "",
                    email: order.userEmail || "",
                    contact: '',
                },
                theme: { color: "#F54D27" },
            };

            RazorpayCheckout.open(options).then(async (data) => {
                try {
                    await api.post(`/api/order/${order._id}/pay`, {
                        userid,
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_order_id: data.razorpay_order_id,
                        razorpay_signature: data.razorpay_signature,
                    });
                    showNotify("Success Payment Successful!");

                    navigation.navigate("orders");
                } catch (err) {
                    showNotify("Error Verification failed. Contact support.");
                }
            }).catch((error) => {
                showNotify("Payment Cancelled",);
            });

        } catch (err) {
            showNotify("Error Could not initiate payment");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#F54D27" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                {/* Status Header */}
                <View style={styles.header}>
                    <View style={styles.badge}>
                        <Feather name="shield" size={14} color="#10b981" />
                        <Text style={styles.badgeText}>SECURE ORDER GENERATED</Text>
                    </View>
                    <Text style={styles.title}>Finalize Payment</Text>
                    <Text style={styles.subtitle}>ID: #{order?._id}</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    <View style={styles.packageHeader}>
                        <Feather name="package" size={18} color="#9ca3af" />
                        <Text style={styles.packageLabel}>YOUR PACKAGE</Text>
                    </View>

                    {order?.products.map((item) => (
                        <View key={item._id} style={styles.itemRow}>
                            <View>
                                <Text style={styles.itemName}>{item.product.name}</Text>
                                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
                            </View>
                            <Text style={styles.itemPrice}>₹{item.price}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    {/* Pricing Summary */}
                    <View style={styles.summaryContainer}>
                        <View>
                            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                            <Text style={styles.totalPrice}>₹{order?.totalPrice}</Text>
                        </View>
                        <View style={styles.methodBadge}>
                            <Text style={styles.methodText}>{order?.paymentMethod}</Text>
                        </View>
                    </View>

                    {order?.paymentMethod === "Online" ? (
                        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                            <Feather name="credit-card" size={20} color="#fff" />
                            <Text style={styles.payButtonText}>PAY WITH RAZORPAY</Text>
                            <Feather name="chevron-right" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.codBox}>
                            <Text style={styles.codText}>Ready to Ship! Payment on Delivery.</Text>
                        </View>
                    )}

                    <View style={styles.footerLock}>
                        <Feather name="lock" size={12} color="#9ca3af" />
                        <Text style={styles.lockText}>256-BIT ENCRYPTED SECURE TRANSACTION</Text>
                    </View>
                </View>

                {/* Shipping Address */}
                <View style={styles.shippingCard}>
                    <Feather name="map-pin" size={20} color="#9ca3af" />
                    <View style={styles.shippingInfo}>
                        <Text style={styles.shippingLabel}>SHIPPING TO</Text>
                        <Text style={styles.addressText}>{order?.address}</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
    scroll: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.1)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginBottom: 12 },
    badgeText: { color: '#10b981', fontSize: 10, fontWeight: '900', marginLeft: 6 },
    title: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', color: '#111827' },
    subtitle: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
    card: { backgroundColor: '#ffffff', borderRadius: 30, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    packageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, opacity: 0.5 },
    packageLabel: { fontSize: 10, fontWeight: '900', marginLeft: 8, color: '#111827' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    itemName: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', color: '#111827' },
    itemQty: { fontSize: 12, color: '#9ca3af' },
    itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
    divider: { height: 1, backgroundColor: 'rgba(156,163,175,0.1)', marginVertical: 20, borderStyle: 'dashed', borderRadius: 1 },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 25 },
    totalLabel: { fontSize: 10, fontWeight: '900', color: '#9ca3af' },
    totalPrice: { fontSize: 36, fontWeight: '900', color: '#F54D27', fontStyle: 'italic' },
    methodBadge: { backgroundColor: '#f3f4f6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
    methodText: { fontSize: 10, fontWeight: 'bold', color: '#111827' },
    payButton: { backgroundColor: '#111827', borderRadius: 20, height: 65, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    payButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    codBox: { padding: 15, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 20, borderWidth: 1, borderColor: '#10b981', alignItems: 'center' },
    codText: { color: '#10b981', fontWeight: 'bold', fontStyle: 'italic' },
    footerLock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, opacity: 0.4 },
    lockText: { fontSize: 8, fontWeight: 'bold', marginLeft: 5, color: '#111827' },
    shippingCard: { marginTop: 15, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#ffffff', borderWeight: 1, borderColor: '#f3f4f6' },
    shippingInfo: { flex: 1 },
    shippingLabel: { fontSize: 10, fontWeight: '900', color: '#9ca3af', marginBottom: 4 },
    addressText: { fontSize: 12, lineHeight: 18, color: '#111827' }
});