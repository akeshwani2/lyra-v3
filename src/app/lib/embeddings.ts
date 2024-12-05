import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

// This function gets the embeddings from the OpenAI API, and returns the embedding as an array of numbers, meaning it's a vector of numbers
export async function getEmbeddings(text: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text.replace(/\n/g, ' '),
      }),
    });

    const result = await response.json();

    // Add error checking
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.log('Unexpected API response:', result);
      throw new Error('Invalid response from OpenAI API');
    }

    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error calling openai embeddings api", error);
    throw error;
  }
}