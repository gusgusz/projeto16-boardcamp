import express from "express";
import cors from 'cors';
import pkg from 'pg';
import joi from 'joi';

const categoriesSchema = joi.object({
    name: joi.string().required(),
});

 
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
    const validation = categoriesSchema.validate(req.body);
    if (validation.error) {
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

app.get("/games", async (req, res) => {
 const { name } = req.query;

    if(!name) {
        try {
            const result = (await connectionDb.query("SELECT * FROM games")).rows;
            res.send(result);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else{
        try {
            const result = (await connectionDb.query("SELECT * FROM games WHERE name LIKE $1", [`${name}%`])).rows;
            res.send(result);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

app.post("/games", async (req, res) => {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    if (!name || !image || !stockTotal || !categoryId || !pricePerDay) {
        res.sendStatus(400);
    }
    else if((await connectionDb.query("SELECT * FROM games WHERE name = $1", [name])).rows.length > 0) {
        res.sendStatus(409);
    } else {
        try {
            await connectionDb.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay]);
            res.sendStatus(201);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

app.get("/customers", async (req, res) => {
    const { cpf } = req.query;

    if(!cpf) {
        try {
            const result = (await connectionDb.query("SELECT * FROM customers")).rows;
            res.send(result);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else{
        try {
            const result = (await connectionDb.query("SELECT * FROM customers WHERE cpf LIKE $1", [`${cpf}%`])).rows;
            res.send(result);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

app.get("/customers/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = (await connectionDb.query("SELECT * FROM customers WHERE id = $1", [id])).rows;
        if(result.length === 0) {
            res.sendStatus(404);
        } else {
            res.send(result[0]);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post("/customers", async (req, res) => {
    const { name, phone, cpf, birthday } = req.body;

    if (!name || !phone || !cpf || !birthday) {
        res.sendStatus(400);
    } else if((await connectionDb.query("SELECT * FROM customers WHERE cpf = $1", [cpf])).rows.length > 0) {
        res.sendStatus(409);
    } else {
        try {
            await connectionDb.query("INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)", [name, phone, cpf, birthday]);
            res.sendStatus(201);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

app.put("/customers/:id", async (req, res) => {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;

    if (!name || !phone || !cpf || !birthday) {
        res.sendStatus(400);
    } else if((await connectionDb.query("SELECT * FROM customers WHERE id = $1", [id])).rows.length > 0) {
        res.sendStatus(409);
    }
     else {
        try {
            await connectionDb.query("UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5", [name, phone, cpf, birthday, id]);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});


const port = 5000;
app.listen(port, () => console.log(`Server Running in port ${port}`));