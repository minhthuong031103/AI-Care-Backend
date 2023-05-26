import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import HistoryModel from '../mongodb/models/historyModel.js';
const openAI = axios.create({
  baseURL: 'https://api.openai.com/v1/',
});
dotenv.config();

const router = express.Router();

router.route('/history').post(async function (req, res) {
  try {
    const { userID } = req.body;

    const history = await HistoryModel.findOne({ user: userID });
    try {
      const messages = Object.values(history.messages);
      return res.status(201).send(messages);
    } catch (error) {
      console.log(error);
      return res.status(501).send('loi');
    }
  } catch (error) {
    console.log(error);
    return res.status(502).send('loi1');
  }
});

router.route('/chatgpt/confide').post(async function (req, res) {
  try {
    const { message, userID } = req.body;
    const history = await HistoryModel.findOne({ user: userID });
    console.log('chua loi');
    let messages = [];
    if (history) {
      const { _id, ...messagesObject } = history.messages;
      messages = Object.values(messagesObject);
      messages.push({
        role: 'user',
        content: message,
      });
      console.log('messages sau khi lay ve tu db \n');
      console.log(messages);
    } else {
      messages.push(
        {
          role: 'system',
          content:
            'Bạn là một nhà chuyên gia tư vấn tâm lý, bạn sẽ giúp đỡ tôi về vấn đề tâm lý.',
        },
        {
          role: 'user',
          content:
            'Xin chào tôi đang tìm kiếm lời khuyên về tư vấn tâm lý. Hãy tư vấn tâm lý cho tôi dưới góc độ của một chuyên gia tâm lý. Bạn có thể hỏi lại tôi để làm rõ về vấn đề tôi cần tư vấn tâm lý nếu như bạn không hiểu rõ' +
            message,
        }
      );
      console.log('messages khi push lan dau \n');
      console.log(messages);
    }
    console.log('messsages khi goi API \n');
    console.log(messages);
    const completion = await openAI.post(
      '/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    const completion_text = completion.data.choices[0].message.content;
    if (history) {
      try {
        messages.push({ role: 'assistant', content: completion_text });
        const update = await HistoryModel.updateOne(
          { user: userID },
          { messages: messages }
        );
        return res.status(200).send({ data: completion_text, status: 200 });
      } catch (error) {
        console.log(error);
        return res.status(503).send('loi');
      }
    } else {
      try {
        messages.push({ role: 'assistant', content: completion_text });

        const newHistory = await HistoryModel.create({
          messages: messages,
          user: userID,
        });

        return res.status(200).send({ data: completion_text, status: 200 });
      } catch (error) {
        console.log(error);
        return res.status(504).send('loi');
      }
    }
  } catch (error) {
    // console.log(error);
    return res.status(505).send('loi');
  }
});
export default router;
