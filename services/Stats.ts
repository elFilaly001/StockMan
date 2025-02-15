import { getProducts } from "./products";
import AsyncStorage from "@react-native-async-storage/async-storage";

const APP_URL = "http://172.16.10.240:3000"


const warehouse_stock_id = async () => {
    const warehousemanStr = await AsyncStorage.getItem('warehouseman');
    const warehouseman = JSON.parse(warehousemanStr || '{}');
    return warehouseman?.warehouseId
}

export const getStats = async () => {
    const response = await fetch(`${APP_URL}/statistics`)
    const data = await response.json()
    return data
}

export const addProduct = async () => {
    const stats = await getStats()
    stats.totalProducts += 1
    fetch(`${APP_URL}/statistics`, {
        method: "PUT",
        body: JSON.stringify(stats)
    })
}

  





