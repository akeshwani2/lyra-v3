import { Pinecone } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'
import { getEmbeddings } from './embeddings'
import md5 from 'md5'
import { convertToAscii } from './utils'
type Vector = {
    id: string;
    values: number[];
    metadata: Record<string, string | number>;
}

let pinecone: Pinecone | null = null

// Helps us initialize the Pinecone client
export const getPineconeClient = async () => {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        })
    }
    return pinecone
}
        
type PDFPage = {
    pageContent: string;
    metadata: {
        loc: { pageNumber: number };
    };
};

export async function loadS3intoPinecone(file_key: string) {
    // 1. Obtain the PDF -> Download and read from PDF
    console.log('Downloading from S3...')
    const file_name = await downloadFromS3(file_key)
    if (!file_name) {
        throw new Error('Failed to download from S3')
    }

    const loader = new PDFLoader(file_name)
    // This returns all the pages of the PDF
    const pages = (await loader.load()) as PDFPage[];

    // 2. Split and segment the pdf into smaller chunks
    const documents = await Promise.all(pages.map(prepareDocument))

    // 3. Vectorize and embed the documents
    const vectors = await Promise.all(documents.flat().map(embedDocument))

    // 4. Upload to Pinecone
    const client = await getPineconeClient()
    const pineconeIndex = await client.Index('lyra-pdf')

    console.log('Inserting vectors into Pinecone...')
    const namespace = convertToAscii(file_key)
    // Break vectors into chunks of 10
    for (let i = 0; i < vectors.length; i += 10) {
        const chunk = vectors.slice(i, i + 10);
        const namespaceIndex = client.Index('lyra-pdf').namespace(namespace);
        await namespaceIndex.upsert(chunk);
    }
    return documents[0]
}

async function embedDocument(doc: Document) {
    try {
        const embedding = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)

        return {
            id: hash,
            values: embedding,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as Vector
    } catch (error) {
        console.log('Error embedding document', error)
        throw error
    }
}

// This function truncates the string by the number of bytes (36000 bytes is 36000 characters). (Basically, it's a hack to get around the 32kb limit for vectors)
export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder()
    return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

// This function prepares the document for indexing
async function prepareDocument(page: PDFPage) {
    const { pageContent, metadata } = page
    const cleanedContent = pageContent.replace(/\n/g, ' ')
    // split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent: cleanedContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber, 
                text: truncateStringByBytes(cleanedContent, 36000)
            }
        })
    ])
    return docs
}