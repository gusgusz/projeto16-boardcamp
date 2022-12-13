import express from "express";
import cors from 'cors';
import pkg from 'pg';
import joi from 'joi';

const categoriesSchema = joi.object({
    name: joi.string().min(1).required(),
});

const gamesSchema = joi.object({
    name: joi.string().min(1).required(),
    image: joi.string().min(5).required(),
    stockTotal: joi.number().required(),
    categoryId: joi.number().min(1).integer().required(),
    pricePerDay: joi.number().min(1).required(),
  });

  const customersSchema = joi.object({
    name: joi.string().min(1).required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().min(11).max(11).required(),
    birthday: joi.date().required()
  });

    const rentalsSchema = joi.object({
    customerId: joi.number().min(1).integer().required(),
    gameId: joi.number().min(1).integer().required(),
    daysRented: joi.number().min(1).required(),
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
    const validation = gamesSchema.validate(req.body);
    if (validation.error) {
        res.sendStatus(400);
    }
    else if (categoryId <= 0 && pricePerDay <= 0) {
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
    const validation = customersSchema.validate(req.body);
    if (validation.error) {
        console.log(validation.error.details[0].message);
        res.sendStatus(400);
    }

     else if((await connectionDb.query("SELECT * FROM customers WHERE cpf = $1", [cpf])).rows.length > 0) {
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

    const validation = customersSchema.validate(req.body);
    if (validation.error) {
        console.log(validation.error.details[0].message);
        res.sendStatus(400);
    }else if((await connectionDb.query("SELECT * FROM customers WHERE cpf = $1", [cpf])).rows.length > 0) {
        res.sendStatus(409);
    }
     else {
        try {
            await connectionDb.query("UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5", [name, phone, cpf, birthday.slice(10), id]);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
});

app.get("/rentals", async (req, res) => {
 
    
    try{
        const rental = (await connectionDb.query("SELECT * FROM rentals")).rows;
        
       let results = [];
       
        
        
    
        res.send(rental);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
   
});

app.post("/rentals", async (req, res) => {
    const { customerId, gameId, daysRented } = req.body;
    const validation = rentalsSchema.validate(req.body);
    const rentDate = new Date();

    if (validation.error) {
        res.sendStatus(400);
    }
    
    const game = (await connectionDb.query("SELECT * FROM games WHERE id = $1", [gameId])).rows;
    const customer = (await connectionDb.query("SELECT * FROM customers WHERE id = $1", [customerId])).rows;
   if(game.length === 0 || customer.length === 0 || daysRented <= 0) {
        res.sendStatus(400);
    
   }
   if(game.stockTotal === 0) {
        res.sendStatus(400);
    
   }

        if(customer.length === 0 || game.length === 0 || daysRented <= 0) {
            res.sendStatus(400);
        }
        const originalPrice = game.pricePerDay * daysRented;
        const returnDate = null;
        const delayFee = null;
        
        console.log(customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee);


        try {
           
            await connectionDb.query
            (`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]);
            res.sendStatus(201);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    
});
app.post("/rentals/:id/return", async (req, res) => {
    const { id } = req.params;
    const returnDate = new Date();
    const rental = (await connectionDb.query("SELECT * FROM rentals WHERE id = $1", [id])).rows[0];
    if(rental.length === 0) {
        res.sendStatus(404);
    }
    if(rental.returnDate !== null) {
        res.sendStatus(400);
    }
    console.log(rental);
    const time = Math.floor((rental.rentDate - returnDate)/ 86400000);
   

  
        try {
            if(time > rental.daysRented){
                const delayFee  = time * (rental.originalPrice/rental.daysRented)
        
            
            await connectionDb.query(
                `UPDATE rentals SET "delayFee"=$1, "returnDate"=$2 WHERE id=$3`,
                [delayFee, returnDate, id]
              );
              res.sendStatus(200);}
              else{
                await connectionDb.query(
                    `UPDATE rentals SET "returnDate"=$2 WHERE id=$2`,
                    [returnDate, id]
                  );
                  res.sendStatus(200);
              }

            
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        
    }
    
});

const port = 5000;
app.listen(port, () => console.log(`Server Running in port ${port}`));