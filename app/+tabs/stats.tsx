import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getStats } from '../../services/Stats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductByStock } from '../../services/products';

interface Stats {
    totalProducts: number;
    outOfStock: number;
    totalStockValue: number;
    mostAddedProducts: any[];
    mostRemovedProducts: any[];
}

const StatisticsPage = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalStockValue, setTotalStockValue] = useState(0);
    const [warehouseman, setWarehouseman] = useState<string | null>(null);

    useEffect(() => {
        const getWarehouseman = async (): Promise<{ warehouseId: string } | null> => {
            const warehousemanStr = await AsyncStorage.getItem('warehouseman');
            if (warehousemanStr) {
                return JSON.parse(warehousemanStr);
            }
            return null;
        };
        let count = 0
        let totalProducts = 0
        let outOfStock = 0

        const fetchWarehouseman = async () => {
            const warehouseman = await getWarehouseman();
            if (warehouseman) {
                const warehouseId = warehouseman.warehouseId;
                const products = await getProductByStock(warehouseId);
                setWarehouseman(warehouseId);
                products.products.forEach((product: any) => {
                    console.log(product.stocks[0].quantity)
                    totalProducts += 1
                    if (product.stocks[0].quantity > 0) {
                        count += product.price * product.stocks[0].quantity
                    }else{
                        outOfStock += 1
                    }
                })
            } else {
                console.error('Warehouseman is null');
            }
            try {
                setStats((prevStats) => ({
                    totalProducts: totalProducts ?? 0,
                    outOfStock: outOfStock ?? 0,
                    totalStockValue: count ?? 0,
                    mostAddedProducts: prevStats?.mostAddedProducts ?? [],
                    mostRemovedProducts: prevStats?.mostRemovedProducts ?? [],
                }));

            } catch (error) {
                console.error('Error loading statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouseman();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading statistics...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Statistics</Text>

            <ScrollView style={styles.scrollView}>
                <View style={styles.productsGrid}>
                    {/* Total Products Card */}
                    <View style={styles.productBox}>
                        <Text style={styles.productName}>Total Products</Text>
                        <Text style={styles.productPrice}>{stats?.totalProducts ?? 0}</Text>
                    </View>

                    {/* Out of Stock Card */}
                    <View style={styles.productBox}>
                        <Text style={styles.productName}>Out of Stock</Text>
                        <Text style={[styles.productPrice, { color: '#e74c3c' }]}>
                            {stats?.outOfStock ?? 0}
                        </Text>
                    </View>

                    {/* Total Stock Value Card */}
                    <View style={styles.productBox}>
                        <Text style={styles.productName}>Total Stock Value</Text>
                        <Text style={styles.productPrice}>${stats?.totalStockValue ?? 0}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};
// Use the provided StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 50,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 36,
        marginBottom: 40,
        fontWeight: '800',
        color: '#2d3436',
        letterSpacing: 1,
        fontFamily: 'System',
        paddingTop: 5,
    },
    scrollView: {
        width: '100%',
        marginTop: 20,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
    },
    productBox: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#2d3436',
    },
    productPrice: {
        fontSize: 14,
        color: '#2d3436',
        fontWeight: '600',
        marginBottom: 4,
    },
});

export default StatisticsPage;