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

async function setSchemaValidation() {
    try {
        await client.connect()
        console.log("MongoDB 연결 성공")

        const db = client.db(process.env.DB_NAME)
        const collectionName = "users"

        // JSON Schema 정의
        const schemaValidation = {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["googleId", "email", "name", "createdAt"],
                    properties: {
                        googleId: {
                            bsonType: "string",
                            description: "Google ID는 필수이며 문자열이어야 합니다."
                        },
                        email: {
                            bsonType: "string",
                            pattern: "^.+@.+$", // 이메일 형식 검증
                            description: "유효한 이메일 주소여야 합니다."
                        },
                        name: {
                            bsonType: "string",
                            description: "사용자 이름은 필수입니다."
                        },
                        createdAt: {
                            bsonType: "date",
                            description: "생성 날짜는 필수이며 날짜 형식이어야 합니다."
                        }
                    }
                }
            },
            validationLevel: "strict", // 데이터가 반드시 스키마를 따라야 함
            validationAction: "error" // 스키마를 따르지 않으면 에러 발생
        }

        // 컬렉션 생성 및 Schema Validation 적용
        await db.command({
            collMod: collectionName, // 기존 컬렉션 수정
            ...schemaValidation
        })
        console.log(`Schema Validation 설정 완료: ${collectionName}`)
    } catch (err) {
        if (err.codeName === "NamespaceNotFound") {
            console.error("컬렉션이 존재하지 않습니다. 새로 생성 중...")
            const db = client.db("MADCAMP")
            await db.createCollection("users", schemaValidation)
            console.log("컬렉션 생성 및 Schema Validation 설정 완료")
        } else {
            console.error("Schema Validation 설정 실패:", err.message)
        }
    } finally {
        await client.close()
        console.log("MongoDB 연결 종료")
    }
}

async function putOneData() {
    try {
        await client.connect()
        const db = await client.db(process.env.DB_NAME)
        const collection = db.collection("users")

        const data = {
            googleId: "Example",
            email: "john.doe@example.com",
            name: "Exampler",
            createdAt: new Date()
        };

        const result = await collection.insertOne(data);
        console.log(`Document inserted with _id: ${result.insertedId}`);
    } catch(err) {
        console.error("Error: ", err)
    } finally {
        await client.close()
    }
}

//setSchemaValidation()
putOneData()