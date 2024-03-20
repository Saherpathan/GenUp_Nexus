import axios from "axios";

const instance = axios.create({
  // baseURL: "",
  baseURL: "http://127.0.0.1:5000", //! For using local Development, use this URL to connect to your local server.
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
