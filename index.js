import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 1. Kutubxonani import qiling
import apiRoutes from "./routes/api.route.js";

dotenv.config();
const app = express();

// 2. CORS-ni yoqing (hamma manbalarga ruxsat berish uchun)
app.use(cors()); 

app.use(express.json()); 

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});