
import { createReadStream, createWriteStream } from 'fs';
import readline from 'readline';

import { parse } from '../helpers/parse';
import OpenAIStream from './openai-stream';
import { Conversation } from '../types/conversation';
import { appendFile } from 'fs/promises';

const TOKEN_LIMIT = 2048; // Set the token limit
const CHUNK_SIZE = TOKEN_LIMIT / 2; // Set the chunk size to avoid exceeding the token limit

export default class ChatHistoryProcessor {
  private filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async process() {
    const chatHistoryStream = createReadStream(this.filepath, { encoding: 'utf-8' });

    const rl = readline.createInterface({
      input: chatHistoryStream,
      output: process.stdout,
      terminal: false,
    });

    let buffer: string = '';

    for await (const line of rl) {
      buffer += '\n' + line;

      while (buffer.length > CHUNK_SIZE) {
        const chunk = buffer.slice(0, CHUNK_SIZE);
        buffer = buffer.slice(CHUNK_SIZE);
        await this.processChunk(chunk);
      }
    }

    if (buffer.length > 0) {
      await this.processChunk(buffer);
    }
  }

  async processChunk(chunk: string) {
    // Preprocess the chunk if necessary
    const preprocessedChunk: Array<Conversation> = await this.preprocessChunk(chunk);

    // starts with the assistant prefix
    await this.appendFile(`\nassistant: `);

    // Process the preprocessed chunk using the OpenAI API
    let processedChunk = "";
    // This data is a ReadableStream
    const data = await OpenAIStream(preprocessedChunk);
    if (!data) {
      console.log("No data from response.", data);
      throw new Error("No data from response.");
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      processedChunk += chunkValue;
      await this.appendFile(chunkValue);
    }

    // Postprocess the processed chunk if necessary
    const postprocessedChunk = await this.postprocessChunk(processedChunk);

    // Closes the results, e.g., output to console or save to a file or close opened file/process
    await this.handleResults(postprocessedChunk);
  }

  async preprocessChunk(chunk: string): Promise<Array<Conversation>> {
    // Implement any necessary preprocessing, e.g., removing stop words, punctuations, etc.
    return parse(chunk);
  }

  async postprocessChunk(chunk: string): Promise<string> {
    // Implement any necessary postprocessing, e.g., reassembling text, etc.
    return chunk;
  }

  async handleResults(results: string): Promise<void> {
    // ends with the user postfix
    await this.appendFile(`\n\nuser: `);

    // do something with the results string
  }

  async appendFile(chunk: string) {
    // append the results to the file
    await appendFile(this.filepath, chunk, { encoding: 'utf8' });
  }
}
