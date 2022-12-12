import express from "express";
import cors from 'cors';
import pkg from 'pg';

 
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




app.get("/categories", async (req, res) => {
    try {
        const result = (await connectionDb.query("SELECT * FROM categories")).rows;
        res.send(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/categories", async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.sendStatus(400);
    } else if((await connectionDb.query("SELECT * FROM categories WHERE name = $1", [name])).rows.length > 0) {
        res.sendStatus(409);
    }
    else {
        try {
            await connectionDb.query("INSERT INTO categories (name) VALUES ($1)", [name]);
            res.sendStatus(201);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

const port = 5000;
app.listen(port, () => console.log(`Server Running in port ${port}`));