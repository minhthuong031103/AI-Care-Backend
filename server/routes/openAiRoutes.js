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
    const { message, userID, _username } = req.body;

    const history = await HistoryModel.findOne({ user: userID });

    console.log('chua loi');
    let messages = [];
    if (history) {
      const { _id, ...messagesObject } = history.messages;
      messages = Object.values(messagesObject);
      //Lay 6 cau cuoi
      // messages = messages.slice(-6);

      // Lay 3 cau dau 3 cau cuoi
      const firstThreeMessages = messages.slice(0, 3);

      const lastThreeMessages = messages.slice(-3);
      messages = firstThreeMessages.concat(lastThreeMessages);

      messages.push({
        role: 'user',
        content: '' + message,
      });
      console.log('messages sau khi lay ve tu db \n');
      console.log(messages);
    } else {
      messages.push(
        {
          role: 'system',
          content: `Tôi tên là ${_username}. Bạn tên là EmotiBot, một trợ lý ảo của nền tảng AI-Care và là một nhà chuyên gia tư vấn tâm lý, không phải là một trợ lý ảo, bạn sẽ giúp đỡ tôi về vấn đề tâm lý, bạn có thể ghi nhớ tên tôi và các câu chuyện để đưa ra lời khuyên.`,
        },

        {
          role: 'user',
          content:
            `Tôi tên là ${_username} (hãy ghi nhớ tên của tôi, tên của bạn và nội dung tôi chia sẻ về sau và khi được hỏi những câu "Tôi tên là gì?/ Bạn còn nhớ tên tôi không?/ Bạn có biết tên tôi là gì không?" thì hãy chỉ trả lời "Tên của bạn là ${_username}". Khi tôi hỏi "Tên của bạn là gì? Bạn tên gì? Bạn là ai?" hãy trả lời "Tôi là EmotiBot, một trợ lý ảo của nền tảng AI-Care "` +
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
    console.log(error);
    return res.status(505).send('loi');
  }
});
export default router;
