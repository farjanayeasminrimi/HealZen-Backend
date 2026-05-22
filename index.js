const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("HealZen");

    //  doctors collection
    const doctorsCollection = database.collection("doctors");
    const departmentsCollection = database.collection("departments");
    const confirmAppointmentsCollection = database.collection("confirmAppointments");

    app.get("/doctors", async (req, res) => {
      const cursor = doctorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/departments", async (req, res) => {
      const cursor = departmentsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/confirmAppointments", async (req, res) => {
      const appointmentData = req.body;
      const appointment = await confirmAppointmentsCollection.insertOne(appointmentData);
      res.json(appointment);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// run
app.get("/", (req, res) => {
  res.send("Welcome to express server");
});

app.listen(port, () => {
  console.log("Server is running in 8000");
});
