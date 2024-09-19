import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Document } from "langchain/document";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type KnowledgeDocument = {
  type: "FAQ" | "transcript";
  question?: string;
  answer?: string;
  title?: string;
  content?: string[];
};

async function loadKnowledgeBase() {
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
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Błąd parsowania JSON:", error.message);
    } else {
      console.error("Błąd podczas ładowania bazy wiedzy:", error);
    }
  }
}
loadKnowledgeBase();
