import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";

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
  video_link?: string;
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
      } else if (
        doc.type === "transcript" &&
        doc.title &&
        doc.content &&
        doc.video_link
      ) {
        doc.content.forEach((line, lineIndex) => {
          const match = line.match(/^(\d+:\d+)\s*(.*)/);
          if (match) {
            const timestamp = match[1];
            const text = match[2];
            const pageContent = `Title: ${doc.title}\nTimestamp: ${timestamp}\nContent:\n${text}`;
            const metadata = {
              type: doc.type,
              title: doc.title,
              video_link: doc.video_link,
              timestamp: timestamp,
              source: "knowledge_base.json",
              index,
              line: lineIndex,
            };
            processedDocuments.push(new Document({ pageContent, metadata }));
          }
        });
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

    const splitDocs: Document[] = [];

    for (const doc of documents) {
      if (doc.metadata.type === "transcript") {
        splitDocs.push(doc);
      } else {
        const chunks = await splitter.splitDocuments([doc]);
        splitDocs.push(...chunks);
      }
    }

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

  try {
    const embeddingsInstance = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
      batchSize: 512,
    });

    const indexPath = path.resolve(__dirname, "../data/hnswlib_index");

    const dataDir = indexPath;
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (mkdirError) {
      console.error(
        "Błąd podczas tworzenia katalogu na indeks HNSWLib:",
        mkdirError
      );
      return;
    }

    const vectorStore = await HNSWLib.fromDocuments(
      splitDocs,
      embeddingsInstance
    );
    await vectorStore.save(indexPath);

    console.log(
      `Dokumenty zostały zaindeksowane w HNSWLib i zapisane pod ścieżką: ${indexPath}`
    );
  } catch (error) {
    console.error("Błąd podczas indeksowania dokumentów w HNSWLib:", error);
  }
};

export default knowledgeProcessor;
