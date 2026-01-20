const express = require('express')
const cors =require('cors')
const app = express()
const port = 3000

require("dotenv").config()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace the placeholder with your Atlas connection string
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7k1gh4c.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();


    const db = client.db('meal_db')

    const userCollection = db.collection('user') //user collection
    const dailyMealCollection = db.collection('daily_meal') //daily_meal collection
    const bazarCollection = db.collection('bazar') //bazar collection
    const guestMealCollection = db.collection('guestmeal') //guestmeal collection



    //user:

    app.get('/user',async(req,res)=>{
        const result = await userCollection.find().toArray();

        console.log(result);

        res.send(result);
    })

    //daily_meal

    app.get('/daily_meal',async(req,res)=>{

        const result = await dailyMealCollection.find().toArray();

        console.log(result);

        res.send(result);

    })

    //bazar:

    app.get('/bazar',async(req,res)=>{

        const result = await bazarCollection.find().toArray();

        console.log(result);

        res.send(result);

    })


    //guest_meal:

    app.get('/guest_meal',async(req,res)=>{

        const result = await guestMealCollection.find().toArray();

        console.log(result);

        res.send(result);

    })



















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
