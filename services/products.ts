import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.16.10.240:3000';

const getProducts = async () => {
    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    return products;
};

const getProductByBarcode_stock = async (barcode: string, stock_id: string) => {
    const products = await getProducts();
    const product = products.find((product: any) => product.barcode === barcode && product.stock.id === stock_id);
    if (product) {
        return { status: true, product };
    }
    return { status: false, product: null };
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
}


const addProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    return response;
}

const updateProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });
    return response;
}

const deleteProduct = async (product: any) => {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'DELETE',
    });
    return response;
}

const updateStock = async (product: any, stock: any) => {
    const foundProduct = await getProductByBarcode(product.barcode);
    const warehouseman = JSON.parse(await AsyncStorage.getItem('warehouseman') || '');
    const warehouseId = warehouseman.warehouseId;

    const stock_id = foundProduct.product.stock.find((stock: any) => stock.id === warehouseId);

    if (stock_id === undefined) {
        foundProduct.product.stock.push({ id: warehouseId, quantity: stock.quantity });
    } else {
        stock_id.quantity += stock.quantity;
    }
    await updateProduct(foundProduct.product);
    return { status: true, product: foundProduct.product };
}


export { getProducts, checkProduct, addProduct, updateProduct, deleteProduct, updateStock };
