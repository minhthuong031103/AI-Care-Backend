import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const historySchema = new Schema({
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      _id: false,
    },
  ],
  // category: {
  // 	type: String,
  // 	enum: ["confide", "solve", "general"],
  // 	required: true,
  // },
  user: {
    type: String,

    required: true,
  },
});

const HistorySchema = mongoose.model('History', historySchema);
export default HistorySchema;
