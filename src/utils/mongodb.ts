import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'

dotenv.config();

const PASSWORD = process.env.MONGODB_PASSWORD;
const USERNAME = process.env.MONGODB_USERNAME;
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
const URI = `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.jcpd3.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`

export const connectClient = async () => {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DATABASE_NAME);

  return {
    db,
    closeClient: async ()=>{
      await client.close();
    }
  };
};
