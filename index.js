const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { verify } = require("node:crypto");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

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
const JWKS = createRemoteJWKSet(new URL(`${process.env.NEXT_CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};
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

    app.post("/confirmAppointments", verifyToken, async (req, res) => {
      const appointmentData = req.body;
      console.log(appointmentData);
      const appointment = await confirmAppointmentsCollection.insertOne(appointmentData);
      res.json(appointment);
    });

    app.patch("/confirmAppointments/:appointmentId", async (req, res) => {
      const appointmentId = req.params.appointmentId;
      const filter = {
        _id: new ObjectId(appointmentId),
      };
      const updatedAppointment = req.body;
      const updateDoc = {
        $set: updatedAppointment,
      };
      const result = await confirmAppointmentsCollection.updateOne(filter, updateDoc);
      res.json(result);
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
