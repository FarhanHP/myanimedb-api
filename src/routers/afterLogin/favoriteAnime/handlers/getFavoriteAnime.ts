import { Handler } from 'express';
import { Db } from 'mongodb';
import { User } from '../../../../interfaces';
import { animeDataArrToAnimeArr } from '../../../../utils';
import { getAnimeDataById } from '../../../../utils/kitsuApi';

const handler: Handler = async (req, res, next) => {
  try {
    const db: Db = res.locals.db;
    const loginUser: User = res.locals.loginUser;
    const { offset, limit } = req.query;
    const offsetNumber = Number(offset);
    const limitNumber = Number(limit);

    if(loginUser) {
      const favoriteAnimeCollection = db.collection('favoriteAnime');
      const query = () => favoriteAnimeCollection.find({userId: loginUser._id})
      const [favoriteAnimeArr, favoriteAnimeCount] = await Promise.all([
        query().sort({createdAt: 1}).skip(offsetNumber).limit(limitNumber).toArray(),
        query().count()
      ]);

      const animeDataArr = await Promise.all(favoriteAnimeArr.map(({animeId}) =>
        getAnimeDataById(animeId)
      ));

      const animeArr = await animeDataArrToAnimeArr(animeDataArr, db, loginUser._id);
      res.status(200).send({
        count: favoriteAnimeCount,
        data: animeArr,
      })
    }
  } catch(err) {
    console.log(err);
    res.status(500).send()
  }

  next();
}

export default handler;
