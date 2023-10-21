import { login, admin, student, teacher, parents, progress, attendance } from "./user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ObjectId} from "mongodb";

dotenv.config();

const userVerification = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ status: false })
    } else {
      const user = await login.findOne({_id:new ObjectId(data.id)});
      if (user) return res.json({ status: true, user: user.email})
      else return res.json({ status: false })
    }
  })
}

const checkUser = async (req, res, next) => {
  const token = req.body.cookies.jwt;
  let user=null;
  if (token) {
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        user = null;
        next();
        return res.json({status:false, user:user});
      } else {
        console.log(decodedToken.id);
        user = await login.findOne({_id:new ObjectId(decodedToken.id)});
        next();
        return res.json({status:true, user:user});
      }
    });
  } else {
    user = null;
    next();
    return res.json({status:false, user});
  }
  
};

export { userVerification, checkUser };