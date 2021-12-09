import express from 'express';
import cors from 'cors';
import { connectClient } from './utils/mongodb';
import userRouter from './routers/userRouter';
import animeRouter from './routers/animeRouter';
import afterLoginRouter from './routers/afterLogin';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//init database connection
app.use(async (req, res, next)=>{
  try{
    const { db, closeClient } = await connectClient();
    res.locals.db = db;
    res.locals.closeClient = closeClient;
  }
  catch(err){
    console.log(err);
    res.status(500).send();
  }

  next();
})

app.get('/', (req, res) => {
  res.send("<h1>MyAnimeDB API</h1>")
});

app.use('/api/user', userRouter);
app.use('/api/anime', animeRouter)
app.use('/api/afterlogin', afterLoginRouter);

//close database connection
app.use(async (req, res)=>{
  await res.locals.closeClient();
});

app.listen(PORT, () => {
  return console.log(`server is listening on http://localhost:${PORT}`);
});
