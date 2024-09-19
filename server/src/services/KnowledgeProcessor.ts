import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY =
  "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";

type KnowledgeDocument = {
  type: "FAQ" | "transcript";
  question?: string;
  answer?: string;
  title?: string;
  content?: string[];
};

const loadKnowledgeBase = async (): Promise<Document[]> => {
  try {
    const filePath = path.resolve(
      __dirname,
      "../knowledge/knowledge_base.json"
    );
    const rawData = await fs.readFile(filePath, "utf-8");
    const knowledgeBase = JSON.parse(rawData) as {
      documents: KnowledgeDocument[];
    };

    const processedDocuments: Document[] = [];

    knowledgeBase.documents.forEach((doc, index) => {
      if (doc.type === "FAQ" && doc.question && doc.answer) {
        const pageContent = `Q: ${doc.question}\nA: ${doc.answer}`;
        const metadata = {
          type: doc.type,
          source: "knowledge_base.json",
          index,
        };
        processedDocuments.push(new Document({ pageContent, metadata }));
      } else if (doc.type === "transcript" && doc.title && doc.content) {
        const cleanedContent = doc.content
          .map((line) => line.replace(/^\d+:\d+\s*/, ""))
          .join("\n");
        const pageContent = `Title: ${doc.title}\nContent:\n${cleanedContent}`;
        const metadata = {
          type: doc.type,
          title: doc.title,
          source: "knowledge_base.json",
          index,
        };
        processedDocuments.push(new Document({ pageContent, metadata }));
      }
    });

    console.log("Przetworzone Dokumenty:");
    processedDocuments.forEach((doc, index) => {
      console.log(`Dokument ${index + 1}:`);
      console.log(`Zawartość: ${doc.pageContent}`);
      console.log(`Metadata: ${JSON.stringify(doc.metadata, null, 2)}`);
      console.log("---------------------------");
    });

    return processedDocuments;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Błąd parsowania JSON:", error.message);
    } else {
      console.error("Błąd podczas ładowania bazy wiedzy:", error);
    }
    return [];
  }
};

const splitDocuments = async (documents: Document[]): Promise<Document[]> => {
  try {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(documents);

    console.log("Podzielone Dokumenty:");
    splitDocs.forEach((doc, index) => {
      console.log(`Podzielony Dokument ${index + 1}:`);
      console.log(`Zawartość: ${doc.pageContent}`);
      console.log(`Metadata: ${JSON.stringify(doc.metadata, null, 2)}`);
      console.log("---------------------------");
    });

    return splitDocs;
  } catch (error) {
    console.error("Błąd podczas dzielenia dokumentów:", error);
    return [];
  }
};

const embedDocuments = async (documents: Document[]): Promise<number[][]> => {
  try {
    const embeddings = new OpenAIEmbeddings({
      apiKey: OPENAI_API_KEY,
      model: "text-embedding-3-large",
      batchSize: 512,
    });

    const vectors = await embeddings.embedDocuments(
      documents.map((doc) => doc.pageContent)
    );

    console.log("Osadzenia (Embeddings) Dokumentów:");
    vectors.forEach((vector, index) => {
      console.log(`Osadzenie Dokumentu ${index + 1}:`);
      console.log(vector.slice(0, 100));
      console.log("---------------------------");
    });

    return vectors;
  } catch (error) {
    console.error("Błąd podczas tworzenia osadzeń dokumentów:", error);
    return [];
  }
};

const knowledgeProcessor = async (): Promise<void> => {
  const docs = await loadKnowledgeBase();

  if (docs.length === 0) {
    console.error("Brak dokumentów do przetworzenia.");
    return;
  }

  const splitDocs = await splitDocuments(docs);

  if (splitDocs.length === 0) {
    console.error("Brak podzielonych dokumentów do dalszego przetwarzania.");
    return;
  }

  const embeddings = await embedDocuments(splitDocs);

  if (embeddings.length === 0) {
    console.error("Błąd podczas tworzenia osadzeń dokumentów.");
    return;
  }

  try {
    const embeddingsInstance = new OpenAIEmbeddings({
      apiKey: OPENAI_API_KEY,
      model: "text-embedding-3-large",
      batchSize: 512,
    });

    const faissIndexPath = path.resolve(__dirname, "../data/faiss_index.bin");

    const dataDir = path.dirname(faissIndexPath);
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (mkdirError) {
      console.error(
        "Błąd podczas tworzenia katalogu na Faiss index:",
        mkdirError
      );
      return;
    }

    const vectorStore = await FaissStore.fromDocuments(
      splitDocs,
      embeddingsInstance
    );
    await vectorStore.save(faissIndexPath);

    console.log(
      `Dokumenty zostały zaindeksowane w Faiss i zapisane pod ścieżką: ${faissIndexPath}`
    );
  } catch (error) {
    console.error("Błąd podczas indeksowania dokumentów w Faiss:", error);
  }
};

export default knowledgeProcessor;
