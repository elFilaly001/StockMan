import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  View, 
  RefreshControl,
  Modal
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getProducts } from '@/services/products';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseProducts, setWarehouseProducts] = useState([]); // products filtered by warehouse
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [warehouseman, setWarehouseman] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchWarehousemanAndProducts = async () => {
    // Get the warehouseman info from AsyncStorage
    const warehousemanStr = await AsyncStorage.getItem('warehouseman');
    if (warehousemanStr) {
      const currentWarehouseman = JSON.parse(warehousemanStr);
      setWarehouseman(currentWarehouseman);

      // Now fetch products
      const productsData = await getProducts();

      // Filter products based on the warehouseId
      const warehouseFiltered = productsData
        .map((product: { stocks?: any[]; stock?: any; [key: string]: any }) => {
          let stockEntry = null;
          // Check if the product has a "stocks" array
          if (product.stocks && Array.isArray(product.stocks)) {
            stockEntry = product.stocks.find((s: { id: string }) => s.id === currentWarehouseman.warehouseId);
          } 
          // Or check if the product has a "stock" property
          else if (product.stock) {
            if (Array.isArray(product.stock)) {
              stockEntry = product.stock.find((s: { id: string }) => s.id === currentWarehouseman.warehouseId);
            } else {
              if (product.stock.id === currentWarehouseman.warehouseId) {
                stockEntry = product.stock;
              }
            }
          }
          if (stockEntry) {
            return { ...product, quantity: stockEntry.quantity };
          }
          return null;
        })
        .filter((product: any) => product !== null);

      setWarehouseProducts(warehouseFiltered);
      setFilteredProducts(warehouseFiltered);
    }
  };

  useEffect(() => {
    fetchWarehousemanAndProducts();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(warehouseProducts);
    } else {
      const searchResults = warehouseProducts.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(searchResults);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWarehousemanAndProducts();
    setRefreshing(false);
  };

  const openModal = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Products</ThemedText>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#999"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}
        >
          <ThemedText style={styles.buttonText}>Search</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((product: any, index: number) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.productBox , {borderWidth: 2,  borderColor: product.quantity > 0 ? product.quantity > 10 ? '#f8f9fa' : '#fdc500' : 'red'}]}
              onPress={() => openModal(product)}
            >
              <Image 
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <ThemedText style={styles.productName}>{product.name}</ThemedText>
              <ThemedText style={styles.productPrice}>
                <ThemedText style={{ fontWeight: 'bold', color: '#6c5ce7' }}>
                  Price:
                </ThemedText> {product.price} DH
              </ThemedText>
              <ThemedText style={styles.productStock}>
                <ThemedText style={{ fontWeight: 'bold', color: '#6c5ce7' }}>
                  Quantity:
                </ThemedText> {product.quantity}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal for product details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedProduct && (
              <>
                <Image 
                  source={{ uri: (selectedProduct as { image: string }).image }}
                  style={styles.modalImage}
                />
                <ThemedText style={styles.modalTitle}>{(selectedProduct as { name: string }).name}</ThemedText>
                <ThemedText style={styles.modalPrice}>Price: {(selectedProduct as { price: number }).price} DH</ThemedText>
                <ThemedText style={styles.modalPrice}>Type: {(selectedProduct as { type: string }).type}</ThemedText>
                <ThemedText style={styles.modalPrice}>Barcode: {(selectedProduct as { barcode: string }).barcode}</ThemedText>
                <ThemedText style={styles.modalPrice}>Supplier: {(selectedProduct as { supplier: string }).supplier}</ThemedText>
                <View style={styles.stockIndicatorContainer}>
                  <View style={[
                    styles.stockIndicator,
                    { backgroundColor: (selectedProduct as { quantity: number }).quantity > 0 ? (selectedProduct as { quantity: number }).quantity > 10 ? 'green' : '#fdc500' : 'red' }
                  ]} />

                  <ThemedText style={styles.stockIndicatorText}>
                    {(selectedProduct as { quantity: number }).quantity > 0 ? (selectedProduct as { quantity: number }).quantity > 10 ? 'In Stock' : 'Low Stock' : 'Out of Stock'}
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

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
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    height: 50,
    flex: 1,
    borderColor: '#b2bec3',
    borderWidth: 1.5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#2d3436',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 13,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'System',
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
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
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
  productStock: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2d3436',
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2d3436',
  },
  stockIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  stockIndicatorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
  },
  closeButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
