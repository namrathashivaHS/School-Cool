import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
// Replace the uri string with your connection string.
const uri = process.env.MONGO_CONNECTTION_STRING;

const client = new MongoClient(uri);

async function connectDB() {
  // Use connect method to connect to the server
  try{
    await client.connect();
  console.log("Connected successfully to db server");
  return "done.";
  }
  catch(err){
    console.log(err.message);
  }
}

connectDB().then(console.log).catch(console.error);
const dbName = "school-cool";
const db = client.db(dbName);

const login=db.collection("login");
const admin = db.collection("admin");
const student=db.collection("student");
const teacher=db.collection("teacher");
const parents=db.collection("parents");
const progress=db.collection("student_progress_report");
const attendance=db.collection("attendance");
const test=db.collection("test");
const student_progress_report=db.collection("student_progress_report");
const chat=db.collection("chat");
const time_table=db.collection("time_table");

export { login, admin, student, teacher, parents, progress, attendance, student_progress_report, chat, time_table };
