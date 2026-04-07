import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Platform } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons'; // Vector Icons Import
import Dummy from "../componet/dummy";
import SignupScreen from "../screen/singup"
import ProductsScreen from "../componet/prodcuts"
import HomeStackNavigaton from "../navigaton/homestack"
import OrdersScreen from '../screen/order';
import ProfileScreen from "../screen/profile"
import { useSelector } from 'react-redux';
import Notifu from '../componet/text';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {

    const { user } = useSelector((state) => state.auth);
    let order = user?.orders?.length || 0


    console.log('orders', user)

    console.log('userdata', order)
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#F54D27", // CoreCart Orange
                tabBarInactiveTintColor: "#A0A0A0",
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabLabel,
                // --- Vector Icon Logic ---
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Orders") {
                        iconName = focused ? "bag" : "bag-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    // Aap yahan size manually bhi control kar sakte hain
                    return <Icon name={iconName} size={focused ? 26 : 22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStackNavigaton} />

            <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarBadge: order }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 85 : 65,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 10,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F3F3F3",
        // Floating effect
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: "800",
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});