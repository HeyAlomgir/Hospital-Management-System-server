const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("🏥 CarePulse Database Successfully Connected to MongoDB Atlas! 🎉");


        const db = client.db("hms");
        const usersCollection = db.collection("users");
        const doctorsCollection = db.collection("doctor")
        const appointmentsCollection = db.collection("appointments");
        const reviewsCollectin = db.collection("review");
        const bookmarksCollection = db.collection("bookmarks")


        app.post("/api/doctors", async (req, res) => {
            const doctor = req.body;
            const result = await doctorsCollection.insertOne(doctor);
            res.send(result);
        });

        // GET all doctors
        app.get("/api/doctors", async (req, res) => {
            const result = await doctorsCollection.find().toArray();
            res.send(result);
        });


        // GET single doctor by id : view detail er jonu
        app.get("/api/doctors/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await doctorsCollection.findOne(query);

                if (!result) {
                    return res.status(404).send({ success: false, message: "Doctor not found" });
                }

                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        });

        // APPROVE doctor
        app.patch("/api/doctors/approve/:id", async (req, res) => {
            const id = req.params.id;
            const result = await doctorsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: "approved" } }
            );
            res.send(result);
        });

        // DELETE doctor

        app.delete("/api/doctors/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await doctorsCollection.deleteOne(query);
                res.send(result)
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        })


        // ---------- REVIEWS ----------

        // Add a review

        app.post("/api/reviews", async (req, res) => {
            try {
                const review = req.body;
                const result = await reviewsCollectin.insertOne(review);
                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        })


        // // Get all reviews for a specific doctor

        app.get("/api/reviews/:doctorId", async (req, res) => {
            try {
                const doctorId = req.params.doctorId;
                const result = await reviewsCollectin.find({ doctorId }).sort({ createdAt: -1 }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        })


        // ---------- BOOKMARKS ----------

        // Add a bookmark


        app.post("/api/bookmarks", async (req, res) => {
            try {
                const bookmark = req.body;

                const exists = await bookmarksCollection.findOne({
                    doctorId: bookmark.doctorId,
                    userEmail: bookmark.userEmail,
                });

                if (exists) {
                    return res.status(409).send({ success: false, message: "Already bookmarked" });
                }

                bookmark.createdAt = new Date();
                const result = await bookmarksCollection.insertOne(bookmark);
                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        })


        // Get all bookmarks for a user
        app.get("/api/bookmarks/:userEmail", async (req, res) => {
            try {
                const userEmail = req.params.userEmail;
                const result = await bookmarksCollection.find({ userEmail }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        });

        // Remove a bookmark
        app.delete("/api/bookmarks/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = await bookmarksCollection.deleteOne({ _id: new ObjectId(id) });
                res.send(result);
            } catch (error) {
                res.status(500).send({ success: false, message: error.message });
            }
        });




        app.get("/", (req, res) => {
            res.send("CarePulse Hospital Management Server is Running...");
        });

    } catch (error) {
        console.error("❌ Database connection error:", error);
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`🚀 CarePulse Server is spinning on port: ${port}`);
});