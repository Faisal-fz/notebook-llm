import 'dotenv/config';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI();

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
          url: 'http://localhost:6333/',
          collectionName: "text", 
      }
    );

    const vectorSearch = vectorStore.asRetriever({ k: 3 });
    const relevantDocs = await vectorSearch.invoke(message);

    const SYSTEM_PROMPT = `
      You are a helpful assistant that answers questions based on the provided documents.
      Use the information from the documents to answer the user's question.
      If you don't know the answer, just say that you don't know.

      Context:
      ${relevantDocs.map(doc => doc.pageContent).join('\n\n')}
    `;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
      ],
    });

    return NextResponse.json({ 
      response: res.choices[0].message.content 
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
