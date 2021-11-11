const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) ;
// require("./doctors-protal-adminsdk.json")
const { messaging } = require('firebase-admin');

const app = express()
const PORT = process.env.PORT;


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(cors())
app.use(express.json());


const verifyToken = async (req, res, next) => {
  if (req.headers?.authorization?.startsWith('Bearer')) {
    const token = req.headers?.authorization?.split(' ')[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
        req.decodedEmail = decodedUser.email
    }
    catch (error) {
      
    }
  }
  next();
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uoagi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri)


async function run() {
    try { 
        await client.connect();
        const database = client.db("apartment-sell");
        const properety = database.collection("properety");
        const reviews = database.collection("review");
        const usersCollection = database.collection('users')
        const orderCollection = database.collection('orders')
        const shippingCollection = database.collection('shipping')


        //all get apis create

        app.get('/users', async (req, res) => {
        const user = req.body;
        const cursor = usersCollection.find(user);
        const users = await cursor.toArray();
        res.json(users)
        });

        app.get('/properety', async (req, res) => {
        const property = req.body;
        const cursor = properety.find(property);
        const result = await cursor.toArray();
        res.json(result)
        });


        app.get('/review', async (req, res) => {
        const user = req.body;
        const cursor = reviews.find(user);
        const result = await cursor.toArray();
        res.json(result)
        });
      
      
        app.get('/shipping', async (req, res) => {
        const order = req.body;
        const cursor = shippingCollection.find(order);
        const result = await cursor.toArray();
        res.json(result)
        });
      
      
        app.get('/order', async (req, res) => {
        const order = req.body;
        const cursor = orderCollection.find(order);
        const result = await cursor.toArray();
        res.json(result)
        });
      
      
        app.get('/order', async (req, res) => {
        const email = req.query.email;
        const query = {email:email}
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.json(result)
        });
        
      

        app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email }
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
            }
        res.json({ admin: isAdmin });
      })

        //all post apis create
         app.post('/properety', async (req, res) => {
        const product = req.body;
        const result = await properety.insertOne(product);
        res.json(result)
         });
        
        
        app.post('/review', async (req, res) => {
        const review = req.body;
        const result = await reviews.insertOne(review);
        res.json(result)
        });
      
      
        app.post('/shipping', async (req, res) => {
        const shipping = req.body;
          const result = await shippingCollection.insertOne(shipping);
        res.json(result)
        });
      
      
        app.post('/order', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.json(result)
        });
        
      
        app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user)
        res.json(result)
        });
        
        // all put user create

        app.put('/users', async (req, res) => {
        
        const user = req.body;
        const filter = { email: user.email }
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result)
            
        })
        
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter,updateDoc)
            
        });

        // delete apis create

            app.delete('/properety/:id', async (req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await properety.deleteOne(query);
          res.send(result)
            });
      
            app.delete('/order/:id', async (req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await orderCollection.deleteOne(query);
          res.send(result)
      });
        
    }
    finally {
    //   await client.close();
    }
}
run().catch(console.dir);
   
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})