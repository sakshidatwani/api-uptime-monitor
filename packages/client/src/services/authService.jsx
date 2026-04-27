import api from './api';

const API_URL = '/api/auth/';


//registeration
const register = async(name, email, password)=>{
    const response = await api.post(API_URL + 'register',{
        name, email, password
    });
    return response.data;
}

//login

const login = async(email, password)=>{
    const response = await api.post(API_URL + 'login',{
        email, password
    });
    return response.data;
}

const authService = {
    register,
    login,
};

export default authService;