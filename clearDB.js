require("dotenv").config()
const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb')

const uri = process.env.DB_URL

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function clearDB() {
    try {
        await client.connect()
        console.log("Connected to DB")

        const db = await client.db(process.env.DB_NAME)
        const collections = await db.listCollections().toArray()
        for (const collection of collections) {
            const col = db.collection(collection.name);
            await col.deleteMany({})
            console.log('Cleared collection '+collection.name)
        }
        console.log('Data deletion finished')

    } catch(err) {
        console.error("Error:", err)
    } finally {
        await client.close()
    }
}

clearDB()