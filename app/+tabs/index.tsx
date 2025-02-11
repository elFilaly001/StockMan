import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput } from 'react-native';
import { checkProduct, addProduct, updateStock } from '../../services/products';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewProduct {
  id: string;
  name: string;
  type: string;
  barcode: string;
  price: string;
  supplier: string;
  stock: {
    id: string,
    quantity: number
  }
}

export default function BarcodeScanner() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    id: '' ,
    name: '',
    type: '',
    price: '',
    supplier: '',
    barcode: '',
    stock: {
      id: '',
      quantity: 0
    }
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setCurrentProduct({ barcode: data });
    const warehouseman = (await AsyncStorage.getItem('warehouseman')) || '';
    const warehouseman_id = JSON.parse(warehouseman).warehouseId;
    const product = await checkProduct(data, warehouseman_id);
    if (product.status) {
      setCurrentProduct(product.product);
      setIsNewProduct(false);
      setModalVisible(true);
    } else {
      setCurrentProduct({ barcode: data });
      setIsNewProduct(true);
      setModalVisible(true);
    }
  };

  const handleSubmit = async () => {

    const warehouseman = (await AsyncStorage.getItem('warehouseman')) || '';
    const warehouseman_id = JSON.parse(warehouseman).warehouseId;
    const ProductId = Math.floor(Math.random() * 10000).toString();

    if (isNewProduct) {
      console.log(`New product added: 
        id: ${ProductId}
        Name: ${newProduct.name}
        Type: ${newProduct.type}
        Price: ${newProduct.price}
        Supplier: ${newProduct.supplier}
        Barcode: ${currentProduct.barcode}
        Stock: ${newProduct.stock.quantity}
      `);
      await addProduct({...newProduct , id: ProductId , barcode: currentProduct.barcode , stock: {id: warehouseman_id, quantity: newProduct.stock.quantity}})
      setModalVisible(false);
      setNewProduct({
        id: '',
        name: '',
        type: '',
        price: '',
        supplier: '',
        barcode: '',
        stock: {
          id: '',
          quantity: 0
        }
      });
    } else {
      console.log(`Added ${newProduct.stock.quantity} of ${currentProduct.name} - ${currentProduct.supplier}`);
      await updateStock(currentProduct , newProduct.stock.quantity)
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'upc_a'],
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isNewProduct ? 'Add New Product' : 'Product Found'}
            </Text>
            
            {!isNewProduct && (
              <>
                <Text style={styles.productName}>{currentProduct?.name} - {currentProduct?.supplier}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  value={newProduct.stock.quantity.toString()}
                  onChangeText={(value) => setNewProduct({
                    ...newProduct, 
                    stock: { ...newProduct.stock, quantity: parseInt(value) || 0 }
                  })}
                />
              </>
            )}

            {isNewProduct && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChangeText={(value) => setNewProduct({...newProduct, name: value})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Product Type"
                  value={newProduct.type}
                  onChangeText={(value) => setNewProduct({...newProduct, type: value})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  keyboardType="decimal-pad"
                  value={newProduct.price}
                  onChangeText={(value) => setNewProduct({...newProduct, price: value})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Supplier"
                  value={newProduct.supplier}
                  onChangeText={(value) => setNewProduct({...newProduct, supplier: value})}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={newProduct.stock.quantity.toString()}
                  onChangeText={(value) => setNewProduct({
                    ...newProduct, 
                    stock: { ...newProduct.stock, quantity: parseInt(value) || 0 }
                  })}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewProduct({
                    id: '',
                    name: '',
                    type: '',
                    price: '',
                    supplier: '',
                    barcode: '',
                    stock: {
                      id: '',
                      quantity: 0
                    }
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.modalButtonText}>
                  {isNewProduct ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
    backgroundColor: 'transparent',
    gap: 15,
  },
  button: {
    backgroundColor: '#6c5ce7',  
    padding: 15,
    borderRadius: 12,
    width: '48%',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
},
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  productName: {
    fontSize: 18,
    marginBottom: 15,
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    gap: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4757',
  },
  confirmButton: {
    backgroundColor: '#6c5ce7',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
