import { ObjectId } from 'bson';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';
import { User } from '../interfaces';

dotenv.config();

const SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRE = 14*24*3600 // 2 weeks in seconds

export const generateToken = (payload: User): Promise<String> => 
  jwt.sign({
      ...payload,
      exp: Math.floor(Date.now()/1000) + TOKEN_EXPIRE
    }, SECRET);

// token: `Bearer ${token}`
export const isValidAndDecodeToken = async (token: string): Promise<User> => {
  const [scheme, parameter] = token.split(' ');
  
  if(scheme === 'Bearer') {
    const payload = jwt.verify(parameter, SECRET)
    const now = Date.now() / 1000;
    
    if(payload.exp > now) {
      return {
        _id: new ObjectId(payload._id as string),
        createdAt: payload.createdAt as number,
        updatedAt: payload.updatedAt as number,
        email: payload.email as string,
        imageUri: payload.imageUri as string,
        fullname: payload.fullname as string,
      }
    }
  }

  return undefined;
}
