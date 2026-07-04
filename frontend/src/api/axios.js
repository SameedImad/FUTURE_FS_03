import axios from "axios";

const API = axios.create({
  baseURL: "https://royal-delight.onrender.com",
});

export default API;
