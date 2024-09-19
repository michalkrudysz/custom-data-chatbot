import { ChatOpenAI } from "@langchain/llms";
import { OpenAIEmbeddings } from "@langchain/embeddings";
import { HNSWLib } from "@langchain/vectorstores";
import { Document } from "@langchain/core";
import * as fs from "fs";
import { join } from "path";

// Hardcoded API key
const OPENAI_API_KEY =
  "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";

// Funkcja ładująca wektorową bazę danych
async function loadVectorStore() {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
  });

  // Wczytaj dokumenty z bazy wiedzy
  const knowledgeBasePath = join(__dirname, "../knowledge/knowledge_base.json");
  const knowledgeBaseContent = fs.readFileSync(knowledgeBasePath, "utf8");
  const knowledgeBase = JSON.parse(knowledgeBaseContent);

  // Utwórz tablicę obiektów Document
  const docs = knowledgeBase.map(
    (item: any) =>
      new Document({
        pageContent: item.content,
        metadata: item.metadata,
      })
  );

  // Utwórz wektorowy magazyn danych
  const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);

  return vectorStore;
}

// Funkcja ustawiająca model ChatOpenAI
function getChatModel() {
  const model = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
    modelName: "gpt-4", // lub 'gpt-3.5-turbo' w zależności od dostępu
    temperature: 0,
  });

  return model;
}

// Główna funkcja obsługująca zapytania użytkownika
async function chatService() {
  try {
    const vectorStore = await loadVectorStore();
    const model = getChatModel();

    // Przykładowe zapytanie
    const query = "Jak mogę zaprosić osobę do zespołu organizacji?";

    // Wyszukaj powiązane dokumenty
    const relevantDocs = await vectorStore.similaritySearch(query, 3);

    // Przygotuj kontekst z pobranych dokumentów
    const context = relevantDocs.map((doc) => doc.pageContent).join("\n");

    // Przygotuj wiadomości dla modelu
    const messages = [
      [
        "system",
        `Jesteś pomocnym asystentem. Użyj poniższego kontekstu, aby odpowiedzieć na pytanie użytkownika.

Kontekst:
${context}
`,
      ],
      ["user", query],
    ];

    // Wywołaj model
    const aiMsg = await model.invoke(messages);

    console.log("Odpowiedź asystenta:");
    console.log(aiMsg.content);
  } catch (error) {
    console.error("Błąd w chatService:", error);
  }
}

export default chatService;
