const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middelware 
app.use(cors());
app.use(express.json());

// Database username and password setup  
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j502d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run()
{
    try {

        await client.connect();
        // console.log('connection to database')
        const database = client.db('autoexpress'); //Database Name
        const purchaseCollection = database.collection('purchase');
        const productsCollection = database.collection('products'); //service database ar collection name 
        const userCollection = database.collection('users');
        //GET API
        app.get('/products', async (req, res) =>
        {
            // const email = req.query.email;
            // const query = { email: email }
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        app.get('/purchase', async (req, res) =>
        {
            const email = req.query.email;
            const query = { email: email }
            const cursor = purchaseCollection.find(query);
            const purchase = await cursor.toArray();
            res.json(purchase);
        });

        app.get('/users', async (req, res) =>
        {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });

        // // Add New products 
        app.post('/products', async (req, res) =>
        {
            const product = req.body;
            // AutoExpress name akta database create kore data pathi dibe 
            const result = await productsCollection.insertOne(product);
            console.log('result');
            res.json(result);
        });
        app.post('/purchase', async (req, res) =>
        {
            const purchase = req.body;
            // AutoExpress name akta database create kore data pathi dibe 
            const result = await purchaseCollection.insertOne(purchase);
            console.log(result);
            res.json(result);
        });
        //Delete API
        app.delete('/purchase/:id', async (req, res) =>
        {
            const id = req.params.id;
            console.log('delete', id);
            const query = { _id: ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            console.log('deleted item', result);
            res.json(result);
        });
        //admin chack

        app.get('/users/:email', async (req, res) =>
        {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {   
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        
        // Post API  User add
        app.post('/users', async (req, res) =>
        {
            const user = req.body;
            console.log('hit the button ', user)
            // user name akta database create kore data pathi dibe 
            const result = await userCollection.insertOne(user);
            res.json(result);
        });
//upsert 
        app.put('/users', async (req, res) =>
        {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) =>
        {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: {role: 'admin'} };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);
// '/' = root a pathanor jonno 
app.get('/', (req, res) =>
{
    res.send('Runing Assingment server');

});
app.listen(port, () =>
{
    console.log('This Auto Express server is runnig');
})
