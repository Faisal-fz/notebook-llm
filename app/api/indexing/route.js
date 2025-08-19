import { TextLoader } from "langchain/document_loaders/fs/text";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create temporary file for TextLoader
    const tempFilePath = path.join(process.cwd(), 'temp.txt');
    fs.writeFileSync(tempFilePath, text);

    const textLoader = new TextLoader(tempFilePath);
    const docs = await textLoader.load();

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });

    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: 'http://localhost:6333/',
      collectionName: "text",
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    console.log("Setup is done...");
    return NextResponse.json({ message: 'Text indexed successfully' });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
