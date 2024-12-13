import axios from "axios";

//import.meta là một đối tượng được tạo ra khi một module JS được import vào một file khác.
//Object này chứa thông tin về module đang được import, bao gồm cả thông tin về môi trường hiện tại
const axiosInstance = axios.create({
  baseURL:
    import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
  withCredentials: true, // send cookies to the server
});

export default axiosInstance;
