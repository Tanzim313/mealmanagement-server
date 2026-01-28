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

    app.get('/users/profile/:email',async(req,res)=>{

        const {email} = req.params;
        
        const result = await userCollection.findOne({email});

        console.log(result);

        res.send(result);
    })


    //daily_meal

    app.get('/meals/:sid',async(req,res)=>{
        
        const { sid } = req.params;

        const result = await dailyMealCollection
        .find({sid})
        .toArray();

        console.log(result);

        res.send(result);

    })

    //bazar:

    app.get('/bazar',async(req,res)=>{

        const result = await bazarCollection.find().toArray();

        console.log(result);

        res.send(result);

    })


    //bazar post:

    app.post("/bazar", async (req, res) => {

        const { date, description, amount } = req.body;
        const data = await bazarCollection.insertOne({ date, description, amount });
        
        res.json(data);
    });



    //guest_meal:

    app.get('/guest_meal',async(req,res)=>{

        const result = await guestMealCollection.find().toArray();

        console.log(result);

        res.send(result);

    })



    //post api : save or updated meal

    app.post("/meals",async(req,res)=>{

        try{

            const {sid,date,breakfast,lunch,dinner,locked,updatedAt} = req.body;

            if(!sid) return res.status(400).json({error:"sid is required"});


            const result = await dailyMealCollection.updateOne(
                {sid,date},
                {
                    $set:{breakfast,lunch,dinner,locked,updatedAt:new Date(updatedAt)},
                },
                {upsert:true}
            );

            res.json({success:true,result});

        }catch(err){
            console.error(err);
            res.status(500).json({error:"Internal server error"});
        }

    });


    









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
