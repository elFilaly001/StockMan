import { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getProducts } from '@/services/products';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);

  
  const  warehouseman = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProducts();
      setProducts(products);
      // console.log(products);
    };
    fetchProducts();
  }, []);



  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Products</ThemedText>
      
      <TextInput
        placeholder="Search products..."
        placeholderTextColor="#666"
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => {/* Handle search */}}
      >
        <ThemedText style={styles.buttonText}>Search</ThemedText>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <View style={styles.productsGrid}>
          {/* Sample Product Box */}
          {products.map((product: any) => (
            <View style={styles.productBox}>
              <Image 
                source={{ uri: product.image }}
              style={styles.productImage}
            />
            <ThemedText style={styles.productName}>{product.name}</ThemedText>
            <ThemedText style={styles.productPrice}>
              <ThemedText style={{ fontWeight: 'bold' , color: '#6c5ce7' }}> Price: </ThemedText>{product.price} DH
            </ThemedText>
            {/* <ThemedText style={styles.productStock}>Stock: {product.stock[0].quantity}</ThemedText> */}
          </View>
        ))}
        </View>
      </ScrollView>
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
  input: {
    height: 50,
    width: '100%',
    borderColor: '#b2bec3',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#2d3436',
    fontFamily: 'System',
  },
  button: {
    backgroundColor: '#6c5ce7',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontSize: 12,
    color: '#666',
  },
});
