import dotenv from 'dotenv';
dotenv.config();

import ChatHistoryProcessor from './lib/chat-history-processor';

(async () => {
  const chatHistoryProcessor = new ChatHistoryProcessor('chat_history.txt');
  await chatHistoryProcessor.process();
})();
