import express from 'express';
import cors from 'cors';
import { PORT, PROVIDER, getProviderConfig } from './config.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import fixRouter from './routes/fix.ts';
import configRouter from './routes/config.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', fixRouter);
app.use('/api', configRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  const config = getProviderConfig();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Provider: ${PROVIDER} | Model: ${config.model}`);
});
