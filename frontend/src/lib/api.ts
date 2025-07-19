import axios from 'axios';

const API_BASE_URL = 'https://ecommercebackend-88sy.onrender.com/api';

const api = axios.create({
  withCredentials: true,
}
)