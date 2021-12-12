import { ObjectId } from 'bson';
import { Router } from 'express';
import { Db } from 'mongodb';
import { User } from '../interfaces';
import { isValidAndDecodeGoogleToken } from '../utils/googleToken';
import { generateToken } from '../utils/jwt';

interface RegisterBody {
  googleToken: string,
}

const router = Router();

// login with google
router.post('/login/google', async (req, res, next) => {
  try {
    const db: Db = res.locals.db;
    const userCollection = db.collection('user');
    const { body }: { body: RegisterBody } = req;

    const response = await isValidAndDecodeGoogleToken(body.googleToken)

    if(response) {
      const { email, picture, name } = response;
      const now = Date.now();
      const user = await userCollection.findOne({email});
      let userObject: User;
      let userId = new ObjectId();

      if(!user) {
        userObject = {
          _id: userId,
          email,
          imageUri: picture,
          fullname: name,
          createdAt: now,
          updatedAt: now,
        };

        await userCollection.insertOne(userObject);
      } else if(user.imageUri !== picture || user.fullname !== name) {
        userId = user._id;
        userObject = {
          _id: userId,
          email,
          imageUri: picture,
          fullname: name,
          updatedAt: now,
          createdAt: user.createdAt,
        }
        await userCollection.updateOne({
          email
        }, {
          '$set' : {
            imageUri: picture,
            fullname: name,
            updatedAt: now,
          }
        })
      } else {
        userObject = {
          _id: user._id,
          email,
          imageUri: picture,
          fullname: name,
          updatedAt: user.updatedAt,
          createdAt: user.createdAt,
        }
      }

      const loginToken = await generateToken(userObject);

      res.status(200).send({
        loginToken: `Bearer ${loginToken}`,
        data: {
          email: email,
          imageUri: picture,
          fullname: name,
        }
      });
      return
    } 

    res.status(400).send();
    
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

  next();
});

export default router;
