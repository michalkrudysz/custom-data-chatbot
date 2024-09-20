import path from "path";
import { fileURLToPath } from "url";
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
import { formatDocumentsAsString } from "langchain/util/document";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INDEX_PATH = path.resolve(__dirname, "../data/hnswlib_index");

const OPENAI_API_KEY =
  "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";

const model = new ChatOpenAI({
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

const qaSystemPrompt = `You are an assistant for question-answering tasks.
  Use the following pieces of retrieved context to answer the question.
  If you don't know the answer, just say that you don't know.
  
  {context}`;

const qaPrompt = ChatPromptTemplate.fromMessages([
  ["system", qaSystemPrompt],
  new MessagesPlaceholder("chat_history"),
  ["human", "{question}"],
]);

const outputParser = new StringOutputParser();

const createRagChain = (retriever: any) => {
  return RunnableSequence.from([
    RunnablePassthrough.assign({
      context: async (input: Record<string, any>) => {
        const retrievedContext = await retriever.invoke(input.question);
        return formatDocumentsAsString(retrievedContext);
      },
    }),
    qaPrompt,
    model,
    outputParser,
  ]);
};

const chatService = async (): Promise<void> => {
  try {
    const vectorStore = await loadVectorStore();
    const retriever = vectorStore.asRetriever();

    const ragChain = createRagChain(retriever);

    let chat_history: Array<HumanMessage | AIMessage> = [];

    const question1 =
      "Testuję aplikację i korzystam z dwóch urządzeń. Gdy zakupię aplikację co się stanie?";

    const response1 = await ragChain.invoke({
      question: question1,
      chat_history: chat_history,
    });

    console.log("Asystent:", response1);

    chat_history.push(new HumanMessage(question1));
    chat_history.push(new AIMessage(response1));

    const question2 = "Co z moimi danymi?";

    const response2 = await ragChain.invoke({
      question: question2,
      chat_history: chat_history,
    });

    console.log("Asystent:", response2);

    chat_history.push(new HumanMessage(question2));
    chat_history.push(new AIMessage(response2));
  } catch (error) {
    console.error("Błąd podczas obsługi zapytania:", error);
  }
};

export default chatService;
