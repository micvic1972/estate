import axios from "axios";

const apiReguest = axios.create({
    baseURL: "http://localhost:8800/api",
    withCredentials: true,
})
export default apiReguest