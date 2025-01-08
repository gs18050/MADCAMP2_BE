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
        const collection_name = "bucketlists";
        const col = db.collection(collection_name);
        await col.deleteMany({})
        console.log('Cleared collection '+collection_name)

    } catch(err) {
        console.error("Error:", err)
    } finally {
        await client.close()
    }
}

async function clearFriends() {
    try {
        await client.connect();
        console.log("Connected to DB");

        const db = await client.db(process.env.DB_NAME);
        const collectionName = "users";
        const col = db.collection(collectionName);

        const result = await col.updateMany({}, { $set: { friends: [] } });
        console.log(`Updated ${result.modifiedCount} documents in ${collectionName}`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

clearDB()
//clearFriends()