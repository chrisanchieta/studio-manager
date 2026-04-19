import express from "express";
import router from "./routes";
import cors from "cors";



function createApp() {
    const app = express();
    
    app.use(cors());
    app.use(express.json());
    app.use("/api/v1", router);

    return app;
}

export default createApp;