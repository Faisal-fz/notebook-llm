import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Processing chat message:', message);

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing OpenAI API key' }, { status: 500 });
    }

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
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

    let vectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        qdrantConfig
      );
    } catch (error) {
      console.error('Failed to connect to Qdrant:', error.message);
      return NextResponse.json({ 
        error: 'No documents found. Please upload some content first.' 
      }, { status: 404 });
    }

    // Search for relevant documents
    const vectorSearch = vectorStore.asRetriever({ k: 3 });
    const relevantDocs = await vectorSearch.invoke(message);

    console.log('Found relevant documents:', relevantDocs.length);

    if (!relevantDocs || relevantDocs.length === 0) {
      return NextResponse.json({ 
        response: "I couldn't find any relevant information in your uploaded documents to answer this question. Please make sure you have uploaded some content first."
      });
    }

    // Prepare context from relevant documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    const SYSTEM_PROMPT = `
      You are a helpful assistant that answers questions based on the provided documents.
      Use the information from the documents to answer the user's question.
      Be specific and cite relevant parts of the documents when possible.
      If the documents don't contain enough information to answer the question, say so clearly.

      Context from uploaded documents:
      ${context}
    `;

    console.log('Sending request to OpenAI...');

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = res.choices[0].message.content;
    console.log('Chat response generated successfully');

    return NextResponse.json({ 
      response: response,
      documentsFound: relevantDocs.length
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Unable to connect to vector database. Please check configuration.' 
      }, { status: 503 });
    }
    
    if (error.message.includes('OpenAI') || error.status === 401) {
      return NextResponse.json({ 
        error: 'OpenAI API error. Please check your API key.' 
      }, { status: 401 });
    }

    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Chat failed: ' + error.message 
    }, { status: 500 });
  }
}
