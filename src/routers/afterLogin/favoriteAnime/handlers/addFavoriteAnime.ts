import { Handler } from 'express';
import { Db } from 'mongodb';
import { User } from '../../../../interfaces';
import { getAnimeById } from '../../../../utils';

const handler: Handler = async (req, res, next) => {
  try {
    const loginUser: User = res.locals.loginUser;
    const { id } = req.params;
    const animeId = id.toLowerCase();
    const db: Db = res.locals.db;
    const favoriteAnimeCollection = db.collection('favoriteAnime');

    if(loginUser) {
      const userId = loginUser._id;
      const favoriteAnime = await favoriteAnimeCollection.findOne({ userId, animeId });

      if(!favoriteAnime) {
        const now = Date.now();
        await favoriteAnimeCollection.insertOne({
          animeId,
          userId,
          createdAt: now,
          updatedAt: now,
        });

        const anime = await getAnimeById(animeId, db, userId);

        res.status(200).send(anime);
        return;
      }

      res.status(400).send();
    }
  } catch(err) {
    console.log(err);
    res.status(500).send();
  }

  next();
};

export default handler;
