import axios from 'axios';
import { useAuthStore  } from '../store/authStore';

const api = axios.create();

api.interceptors.request.use(
    (config)=>{
        const {user} = useAuthStore.getState();
        if(user?.token){
            config.headers['Authorization'] = `Bearer ${user.token}`;
        } 
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
)
export default api;