import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
    try {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        
        const pineconeIndex = await client.index('lyra-pdf');
        const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
        
        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
        });
        
        return queryResult.matches || [];
    } catch (error) {
        console.log('error querying embeddings', error);
        throw error;
    }
}


export async function getContext(query: string, file_key: string) {
    const queryEmbeddings = await getEmbeddings(query)
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, file_key)

    const qualifyingDocs = matches.filter((match) => match.score && match.score > 0.7)
    type Metadata = {
        text: string
        pageNumber: number
    }
    const docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text)

    return docs.join('\n').substring(0, 3000)
}