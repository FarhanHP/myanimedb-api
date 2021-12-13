import { Router } from 'express';
import { Db } from 'mongodb';
import { AnimeData } from '../interfaces';
import { getAnime } from '../utils/kitsuApi';
import { ObjectId } from 'bson';
import { isValidAndDecodeToken } from '../utils/jwt';
import { animeDataArrToAnimeArr } from '../utils';

const router = Router();

router.get('/:offset/:limit', async (req, res, next) => {
  try {
    const db: Db = res.locals.db;
    const { query, params } = req;
    const { keyword } = query;
    const { offset, limit } = params;
    const { authorization } = req.headers;
    let userId: ObjectId;
    
    if(authorization) {
      const user = await isValidAndDecodeToken(authorization);
      if(user) {
        userId = user._id;
      }
    }

    const response = await getAnime(Number(offset), Number(limit), keyword as string);

    if(response.ok) {
      const responseJson = await response.json();
      const animeDataArr: AnimeData[] = responseJson.data
      
      const animeArr = await animeDataArrToAnimeArr(animeDataArr, db, userId)

      res.status(200).send({
        count: responseJson.meta.count,
        data: animeArr,
      });
    } else {
      res.status(response.status).send();
    }
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

  next();
})

export default router;
