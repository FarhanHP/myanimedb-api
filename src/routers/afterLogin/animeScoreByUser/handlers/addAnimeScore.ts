import { Handler } from 'express';
import { Db } from 'mongodb';
import { User } from '../../../../interfaces';
import { isValidScore, updateAnimeScore } from '../../../../utils';

const handler: Handler = async (req, res, next) => {
  try {
    const loginUser: User = res.locals.loginUser;
    const db: Db = res.locals.db;
    const animeScoreByUserCollection = db.collection('animeScoreByUser');
    const { id } = req.params
    const animeId = id.toLowerCase();

    if(loginUser) {
      const { score } = req.body;
      
      if(score && isValidScore(score)) {
        const now = Date.now();
        const animeScoreByUser = await animeScoreByUserCollection.findOne({
          userId: loginUser._id,
          animeId,
        });

        if(!animeScoreByUser) {
          await animeScoreByUserCollection.insertOne({
            userId: loginUser._id,
            animeId,
            score: Number(score),
            createdAt: now,
            updatedAt: now,
          });
  
          const { newAverageScore, newUserCount } = await updateAnimeScore(animeId, db);
  
          res.status(200).send({
            newAverageScore,
            newUserCount,
            animeId,
          })
        }
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
