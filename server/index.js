import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import { router } from "./AuthRoutes.js";
import cookieParser from "cookie-parser";


const app = express();
dotenv.config();
const PORT=process.env.PORT;
app.use(cookieParser());
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/", router);