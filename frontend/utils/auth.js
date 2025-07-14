import axios from "axios"
const API_URL = "http://127.0.0.1:8000/api/users/"

export const registerUser = async (email,username, password) => {
    try {
        const response = await axios.post(`${API_URL}register/`, {email,username,password})
        return response.data
    }
    catch (e) {
        throw new Error("Registration failed")
    }
}
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}login/`, { email, password });
        return response.data;
    } catch (e) {
        if (e.response && e.response.data) {
            throw new Error(JSON.stringify(e.response.data));
        } else {
            throw new Error("Login failed");
        }
    }
}
export const logoutUser = async () => {
    try {
        const response = await axios.post(`${API_URL}logout/`);
        return response.data;
    } catch (e) {
        if (e.response && e.response.data) {
            throw new Error(JSON.stringify(e.response.data));
        } else {
            throw new Error("Logout failed");
        }
    }
}