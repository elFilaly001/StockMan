import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.16.10.240:3000';

const getUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/warehousemans`);
        const users = await response.json();
        return { warehousemans: users };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { warehousemans: [] };
    }
};

export const login = async (secretKey: string) => {
    const users = await getUsers();
    const warehouseman = users.warehousemans.find((warehouseman: any) => warehouseman.secretKey === secretKey);
    if (warehouseman) {
        await AsyncStorage.setItem('warehouseman', JSON.stringify(warehouseman));
        // console.log("warehouseman", warehouseman);
        return { success: true, message: 'Login successful', warehouseman };
    }
    return { success: false, message: 'Invalid secret key' };
};

