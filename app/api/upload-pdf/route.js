import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from 'fs';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('pdf');

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    // Save uploaded file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), 'tmp', filename);
    
    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(join(process.cwd(), 'tmp'));
    }
    
    await writeFile(filepath, buffer);
    console.log('Saved file to:', filepath);

    // Use LangChain's PDFLoader (much faster and more reliable)
    const loader = new PDFLoader(filepath);
    const docs = await loader.load();
    console.log('Loaded documents:', docs.length);

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log('Created chunks:', splitDocs.length);

    // Create embeddings
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    // Store in Qdrant (single operation, much faster)
    let vectorStore;
    try {
      // Try to add to existing collection
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: 'http://localhost:6333/',
          collectionName: "text",
        }
      );
      await vectorStore.addDocuments(splitDocs);
      console.log('Added to existing collection');
    } catch (error) {
      // Create new collection
      console.log('Creating new collection');
      vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          url: 'http://localhost:6333/',
          collectionName: "text",
        }
      );
      console.log('Created new collection');
    }

    // Clean up temporary file
    fs.unlinkSync(filepath);
    console.log('Cleaned up temporary file');

    return NextResponse.json({ 
      message: 'PDF uploaded and indexed successfully',
      pages: docs.length,
      chunks: splitDocs.length,
      filename: file.name
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF: ' + error.message 
    }, { status: 500 });
  }
}
