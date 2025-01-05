require("dotenv").config()
const { MongoClient, ServerApiVersion } = require('mongodb')

// MongoDB Atlas 연결 설정
const uri = process.env.DB_URL
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function putOneData() {
    try {
        await client.connect()
        const db = await client.db(process.env.DB_NAME)
        const collection = db.collection("horoscopes")

        const data = {
            sign: "물고기자리",
            period: { start: "02/19", end: "03/20" },
            image: "https://example.com/Pisces.jpg",
        };

        const result = await collection.insertOne(data);
        console.log(`Document inserted with _id: ${result.insertedId}`);
    } catch(err) {
        console.error("Error: ", err)
    } finally {
        await client.close()
    }
}

putOneData()