const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.7k1gh4c.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("meal_db");

    const userCollection = db.collection("user"); //user collection
    const dailyMealCollection = db.collection("daily_meal"); //daily_meal collection
    const bazarCollection = db.collection("bazar"); //bazar collection
    const guestMealCollection = db.collection("guestmeal"); //guestmeal collection

    //middleware
    const authMiddleware = async (req, res, next) => {
      const authHeader = req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ error: "Missing token" });

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Invalid token" });

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
      } catch (err) {
        res.status(401).json({ error: "Invalid token" });
      }
    };

    //login
    app.post("/login", async (req, res) => {
      try {
            const { email, password } = req.body;
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
          return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        res.json({ message: "Login successful", token });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    });



    app.get("/users",async(req,res)=>{

        const data = await userCollection.find().toArray();

        console.log(data);

        res.send(data);

    })

    //users added database:

    app.post("/users", async (req, res) => {
    
        try {
            const {
                sid,
                name,
                meal_serial,
                room_num,
                department,
                email,
                phone,
                password,
                role,
                status,
    } = req.body;

    // required field check
    if (!sid || !name || !meal_serial || !password) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    //duplicate SID check
    const existingUser = await userCollection.findOne({ sid });
    if (existingUser) {
      return res.status(409).json({
        message: "Resident with this SID already exists",
      });
    }

    const newResident = {
      sid,
      name,
      meal_serial,
      room_num,
      department,
      email,
      phone,
      password,
      role: role || "student",
      status:status,
      createdAt: new Date(),
    };

    const result = await userCollection.insertOne(newResident);

    res.status(201).json({
      success: true,
      message: "Resident added successfully",
      insertedId: result.insertedId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});




    //user:
    app.get("/users/profile/:email", async (req, res) => {
      const { email } = req.params;
      const result = await userCollection.findOne({ email });
      console.log(result);
      res.send(result);
    });

    //user role updated api:

    app.patch("/users/:sid/role",async(req,res)=>{

        const sid = req.params.sid;
        const {role}=req.body;


        const result = await userCollection.updateOne(

            {sid:sid},
            {$set:{role:role}}

        );

        res.json({
            success:true,
            message: `Role updated to ${role}`,
        });
    })

    //users status updated :

    app.patch("/users/:sid/status",async(req,res)=>{
      try{

        const {sid}= req.params;
        const {status} = req.body;

        const result = await userCollection.updateOne(
          {sid:sid},
          {$set:{status:status}}
        );

        res.json({
          success: true,
          message:"Status updated",
        });

      }catch(error){
        res.status(500).json({message:"server error"});
      }
    })


    //daily_meal:

    app.get('/meals/:sid',async(req,res)=>{
        
        const { sid } = req.params;

        const result = await dailyMealCollection
        .find({sid})
        .toArray();

        console.log(result);

        res.send(result);

    });

     //post api : save or updated meal
    app.post("/meals", async (req, res) => {
    try {
        const { sid, date, breakfast, lunch, dinner, locked, updatedAt } =
        req.body;

        if (!sid) return res.status(400).json({ error: "sid is required" });

        const result = await dailyMealCollection.updateOne(
        { sid, date },
        {
            $set: {
              breakfast,
              lunch,
              dinner,
              locked,
              updatedAt: new Date(updatedAt),
            },
          },
          { upsert: true },
        );

        res.json({ success: true, result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    });




    //bazar get:
    
    app.get('/bazar',async(req,res)=>{

        const result = await bazarCollection.find().toArray();

        console.log(result);

        res.send(result);

    })


    //bazar post:
    app.post("/bazar", async (req, res) => {
      const { date, description, amount } = req.body;
      const data = await bazarCollection.insertOne({
        date,
        description,
        amount,
      });

      res.json(data);
    });



    //guest_meal:
    app.get("/guest_meal", async (req, res) => {
      const result = await guestMealCollection.find().toArray();

      console.log(result);

      res.send(result);
    });

    //guest meal input:
    app.post("/guest-meals",async(req,res)=>{
      const {date,meals,rates,total} = req.body;

      const filter = {date};
      const updateDoc={
        $set:{
          meals,
          rates,
          total,
          updatedAt:new Date(),
        },
        $setOnInsert:{
          createdAt:new Date(),
        },
      };

      const options = {upsert:true};




      const result = await guestMealCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      console.log(result);

      res.json({success:true});
      
    });






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});