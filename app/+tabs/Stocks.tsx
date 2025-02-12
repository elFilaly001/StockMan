import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    TextInput,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Platform
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getProducts } from '@/services/products';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Define the Stock interface
interface Stock {
    name?: string;
    quantity: number;
}

// Define the Product interface
interface Product {
    name: string;
    price: number;
    stocks: Stock[];
}

// Define the StockRow interface
interface StockRow {
    productName: string;
    price: number;
    location: string;
    quantity: number;
}

export default function StockScreen() {
    const [stockRows, setStockRows] = useState<StockRow[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [quantityFilter, setQuantityFilter] = useState('');

    const fetchStockData = async () => {
        const productsData = await getProducts();
        const rows: StockRow[] = productsData.reduce((acc: StockRow[], product: Product) => {
            let stocksArray: Stock[] = [];
            if (product.stocks && Array.isArray(product.stocks)) {
                stocksArray = product.stocks;
            } else if (Array.isArray(product.stocks)) {
                stocksArray = product.stocks;
            } else {
                stocksArray = [product.stocks];
            }
            stocksArray.forEach(stock => {
                acc.push({
                    productName: product.name,
                    price: product.price,
                    location: stock.name || '',
                    quantity: stock.quantity,
                });
            });
            return acc;
        }, []);
        setStockRows(rows);
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStockData();
        setRefreshing(false);
    };

    const filteredRows = stockRows.filter((row: StockRow) => {
        const matchesSearch = row.productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = priceFilter ? row.price <= parseFloat(priceFilter) : true;
        const matchesQuantity = quantityFilter ? row.quantity >= parseInt(quantityFilter, 10) : true;
        return matchesSearch && matchesPrice && matchesQuantity;
    });

    const generatePDF = async () => {
        const htmlContent = `
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      margin: 20px;
    }
    h2 {
      text-align: center;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #6c5ce7;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    header {
      position: fixed;
      top: 0;
      width: 100%;
      text-align: center;
      border-bottom: 1px solid #ddd;
      padding: 10px 0;
    }
    footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      text-align: center;
      border-top: 1px solid #ddd;
      padding: 10px 0;
    }
    .page-number:before {
      content: "Page " counter(page);
    }
  </style>
</head>
<body>
  <footer>
    <div class="page-number"></div>
  </footer>
  <h2>Stock Overview</h2>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Price</th>
        <th>Location</th>
        <th>Quantity</th>
      </tr>
    </thead>
    <tbody>
      ${filteredRows.map(row => `
        <tr>
          <td>${row.productName}</td>
          <td>${row.price} DH</td>
          <td>${row.location}</td>
          <td>${row.quantity}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>

    `;

        try {
            const { uri } = await Print.printToFileAsync({
                html: htmlContent,
                base64: false
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Download Stock Report'
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'An error occurred while generating the PDF.');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Stock Overview</ThemedText>

            <View style={styles.filterContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search Product Name"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Max Price"
                    value={priceFilter}
                    onChangeText={setPriceFilter}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Min Quantity"
                    value={quantityFilter}
                    onChangeText={setQuantityFilter}
                    keyboardType="numeric"
                />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <ThemedText style={[styles.tableCell, styles.headerCell]}>Product</ThemedText>
                        <ThemedText style={[styles.tableCell, styles.headerCell]}>Price</ThemedText>
                        <ThemedText style={[styles.tableCell, styles.headerCell]}>Location</ThemedText>
                        <ThemedText style={[styles.tableCell, styles.headerCell]}>Quantity</ThemedText>
                    </View>
                    {filteredRows.map((row, index) => (
                        <View key={index} style={styles.tableRow}>
                            <ThemedText style={styles.tableCell}>{row.productName}</ThemedText>
                            <ThemedText style={styles.tableCell}>{row.price} DH</ThemedText>
                            <ThemedText style={styles.tableCell}>{row.location}</ThemedText>
                            <ThemedText style={styles.tableCell}>{row.quantity}</ThemedText>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.button} onPress={generatePDF}>
                <ThemedText style={styles.buttonText}>Download PDF</ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 50,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#2d3436',
        letterSpacing: 1,
        paddingTop: 5,
        marginBottom: 20,
    },
    filterContainer: {
        width: '100%',
        marginBottom: 1,
    },
    input: {
        height: 40,
        borderColor: '#b2bec3',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 5,
        backgroundColor: 'white',
        color: '#2d3436',
    },
    scrollView: {
        width: '100%',
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#b2bec3',
        borderRadius: 12,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#6c5ce7',
        paddingVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: '#2d3436',
        textAlign: 'center',
    },
    headerCell: {
        fontWeight: '700',
        color: 'white',
    },
    button: {
        backgroundColor: '#6c5ce7',
        padding: 13,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        margin: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});
