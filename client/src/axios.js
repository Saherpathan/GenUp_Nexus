import axios from "axios";

const debug = localStorage.getItem("debug");

const url = "http://192.168.29.59:5000";

console.log(url);

const instance = axios.create({
  baseURL: url, //! For using local Development, use this URL to connect to your local server.
});

instance.interceptors.request.use((req) => {
  if (localStorage.getItem("user")) {
    req.headers.Authorization = `Bearer ${
      JSON.parse(localStorage.getItem("user")).token
    }`;
  }

  return req;
});

export default instance;
