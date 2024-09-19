import knowledgeProcessor from "./services/knowledgeProcessor";

const runKnowledgeProcessor = async () => {
  try {
    await knowledgeProcessor();
    console.log("Proces indeksowania zakończony.");
  } catch (error) {
    console.error("Błąd w procesie indeksowania:", error);
  }
};

runKnowledgeProcessor();
