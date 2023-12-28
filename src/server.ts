import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { getTranscript } from './utils/getTranscript';
import { splitTranscription } from './utils/splitTranscription';
import { summarizer } from './utils/summarizer';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

interface SummarizeRequest extends Request {
  query: {
    url: string;
  };
}

app.post('/summarize', async (req: SummarizeRequest, res: Response) => {
  const { url } = req.query;

  const regex =
    /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/g;

  if (!url || !regex.test(url)) {
    console.debug(`⛔ YouTube URL Invalid`);
    return res.status(400).send({ error: 'Invalid YouTube URL' });
  }

  console.debug(`🤖 Summarizing ${url}`);

  const transcript = await getTranscript(url);

  const chunks = splitTranscription(transcript);

  const { summary, topics, coverImage } = await summarizer(chunks);

  res.send({ summary, topics, coverImage });
});

app.listen(port, () => {
  console.log(`🚪 Server started on port ${port}`);
});
