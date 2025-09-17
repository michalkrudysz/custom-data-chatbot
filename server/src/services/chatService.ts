import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Document } from "langchain/document";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INDEX_PATH = path.resolve(__dirname, "../data/hnswlib_index");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error(
    "Brak zmiennej środowiskowej OPENAI_API_KEY. Dodaj ją do server/.env."
  );
}

const chatModel = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.7,
  openAIApiKey: OPENAI_API_KEY,
  maxTokens: 1050,
});

const loadVectorStore = async (): Promise<HNSWLib> => {
  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
    });

    const vectorStore = await HNSWLib.load(INDEX_PATH, embeddings);
    console.log("Wektorowa baza danych została pomyślnie załadowana.");
    return vectorStore;
  } catch (error) {
    console.error("Błąd podczas ładowania wektorowej bazy danych:", error);
    throw error;
  }
};

function formatVideoLink(video_link: string, timestamp: string): string {
  const [minutes, seconds] = timestamp.split(":").map(Number);
  const totalSeconds = minutes * 60 + seconds;
  return `${video_link}&t=${totalSeconds}s`;
}

const qaSystemPrompt = `You are an assistant created by Michał Krudysz. Use the provided context fragments to respond to queries. If the answer comes from a video transcript, include a link to the video with the relevant timestamp in your response. If you don’t know the answer, simply say you don’t know. If asked which company you work for or who you represent, say you work with Michał Krudysz. If asked who created you, answer: "Michał Krudysz".
{context}`;

const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", qaSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const outputParser = new StringOutputParser();

const createQAChain = (retriever: any) => {
  return RunnableSequence.from([
    RunnablePassthrough.assign({
      context: async (input: Record<string, any>) => {
        const retrievedDocs: Document[] = await retriever.invoke(
          input.question
        );
        const formattedContext = retrievedDocs
          .map((doc: Document) => {
            if (
              doc.metadata.type === "transcript" &&
              doc.metadata.timestamp &&
              doc.metadata.video_link
            ) {
              const timestamp = doc.metadata.timestamp;
              const videoLink = doc.metadata.video_link;
              const formattedVideoLink = formatVideoLink(videoLink, timestamp);
              return `W wideo "${doc.metadata.title}" o czasie ${timestamp} jest powiedziane: "${doc.pageContent}"\nObejrzyj tutaj: ${formattedVideoLink}`;
            } else {
              return doc.pageContent;
            }
          })
          .join("\n");
        return formattedContext;
      },
    }),
    qaPrompt,
    chatModel,
    outputParser,
  ]);
};

const vectorStorePromise = loadVectorStore();

type ChatServiceInput = {
  question: string;
  chat_history: Array<HumanMessage | AIMessage>;
};

const chatService = async ({
  question,
  chat_history,
}: ChatServiceInput): Promise<string> => {
  try {
    const vectorStore = await vectorStorePromise;
    const retriever = vectorStore.asRetriever();
    const qaChain = createQAChain(retriever);
    const response = await qaChain.invoke({
      question,
      chat_history,
    });
    return response;
  } catch (error) {
    console.error("Błąd podczas obsługi zapytania:", error);
    throw error;
  }
};

export default chatService;
