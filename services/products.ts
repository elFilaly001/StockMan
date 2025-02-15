import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.137.1:3000';

const getProducts = async () => {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    return products;
};
const getProductByStock = async (stock_id: string) => {
    // Fetch all products
    const products = await getProducts();
  
    // Filter products that have the specified stock_id in their stocks array
    const filteredProducts = products.filter((product: any) =>
      product.stocks.some((stock: any) => stock.id === stock_id)
    );

    if (filteredProducts.length > 0) {
      return { status: true, products: filteredProducts };
    } else {
      return { status: false, products: [] };
    }
  };
  

const getProductByBarcode = async (barcode: string) => {
    const products = await getProducts();
    const product = products.find((product: any) => product.barcode === barcode);
    if (product) {
        return { status: true, product };
    }
    return { status: false, product: null };
};

const checkProduct = async (barcode: string) => {
    const product = await getProductByBarcode(barcode);
    if (product.status) {
        return { status: true, product: product.product };
    }
    return { status: false, product: null };
};

const addProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    return response;
};

const updateProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    return response;
};

const deleteProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'DELETE',
    });
    return response;
};

const updateStocks = async (product: any, stocks: any) => {
    const foundProduct = await getProductByBarcode(product.barcode);
    const warehouseman = JSON.parse(await AsyncStorage.getItem('warehouseman') || '{}');
    const warehouseId = warehouseman.warehouseId;
    const stockEntry = foundProduct.product.stocks.find((stock: any) => stock.id === warehouseId);

    if (stockEntry === undefined) {
        foundProduct.product.stocks.push({ id: warehouseId, quantity: stocks.quantity });
    } else {
        stockEntry.quantity += stocks.quantity;
    }
    await updateProduct(foundProduct.product);
    return { status: true, product: foundProduct.product };
};

export { getProducts, checkProduct, addProduct, updateProduct, deleteProduct, updateStocks , getProductByStock};
