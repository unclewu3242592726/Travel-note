// src/api/client.js
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // 自动读取环境变量
  timeout: 5000, // 设置超时时间为5秒
});

// 添加请求拦截器，在请求头中添加通用信息
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

export default instance;