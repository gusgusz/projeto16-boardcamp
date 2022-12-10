import express from "express";
import cors from 'cors';
import pkg from 'pg';
import categoriesRoutes from './routes/categories.routes.js';
 
const { Pool } = pkg;
const connectionDb = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "gusgusgus",
    database: "boardcamp",
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(categoriesRoutes);

const port = 5000;
app.listen(port, () => console.log(`Server Running in port ${port}`));