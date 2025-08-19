import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text } = await req.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('Processing text, length:', text.length);

    // Create document directly (no file system needed)
    const docs = [new Document({ 
      pageContent: text,
      metadata: { 
        source: 'user_input',
        type: 'text',
        uploadedAt: new Date().toISOString()
      }
    })];

    // Split documents into chunks for better retrieval
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log('Created chunks:', splitDocs.length);

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing OpenAI API key' }, { status: 500 });
    }

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });

    // Use environment variables for Qdrant connection
    const qdrantConfig = {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: "text",
    };

    // Add API key if available (for Qdrant Cloud)
    if (process.env.QDRANT_API_KEY) {
      qdrantConfig.apiKey = process.env.QDRANT_API_KEY;
    }

    console.log('Connecting to Qdrant at:', qdrantConfig.url);

    try {
      // Try to add to existing collection first
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        qdrantConfig
      );
      await vectorStore.addDocuments(splitDocs);
      console.log('Added to existing collection');
    } catch (error) {
      console.log('Creating new collection:', error.message);
      // Create new collection if it doesn't exist
      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs, 
        embeddings, 
        qdrantConfig
      );
      console.log('Created new collection');
    }

    console.log("Setup is done...");
    return NextResponse.json({ 
      message: 'Text indexed successfully',
      chunks: splitDocs.length,
      textLength: text.length
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Unable to connect to vector database. Please check configuration.' 
      }, { status: 503 });
    }
    
    if (error.message.includes('OpenAI')) {
      return NextResponse.json({ 
        error: 'OpenAI API error. Please check your API key.' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}
