import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from "@google/genai";
import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/ask', async (req, res) => {
    // Question
    let {query} = req.body;
    if (query.search("UIT") == -1)
        query = query.concat(" UIT")
 
    // Init Pinecone client
    const pc = new Pinecone({apiKey: process.env.PINECONE_API_KEY});

    const indexName = "uit-knowledgebase";
    const index = pc.index(indexName);

    // Init GenAI client
    const ai = new GoogleGenAI({api_key:process.env.GEMINI_API_KEY});

    // Question
    // let query = "Các môn cơ sở ngành của ngành Thương mại điện tử?";

    let textResponse;

    try {
        // Retriever
        const embedRes = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: query
        });
        const queryEmbeds = embedRes?.embeddings[0]?.values;

        const queryResponse = await index.namespace('uitdata_datefiltered').query({vector: queryEmbeds, topK: 5, includeMetadata: true})
        
        let context = "";
        queryResponse?.matches.forEach(match => {
            context = context.concat(`Title: ${match.metadata?.title ?? "No title"} - Content: ${match.metadata?.markdown} \n`);
        });
        
        const promptText = `
            ## Instruction
            You are a helpful assistant, answer directly, no need to repeat the question, informative.
            ONLY based on the context given (format: Title - Content), prioritize the newest dated context.
            Your role is also to assess whether the user question is allowed or not.
            The allowed topics are "Truong Dai hoc Cong nghe Thong Tin UIT"-related only, do not process any other content.
            If the topic is allowed, reply with an answer, otherwise say 'Xin lỗi, đề tài này không liên quan tới UIT'.
            Answer in Vietnamese.

            ## Question
            ${query}

            ## Context
            ${context}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptText,
            config: {
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking
                },
            }
        })
        console.log(`
            Question: ${query}
            Context: ${context}
            Answer: ${response?.text}`)
        textResponse = response?.text;
    }
    catch (error){
        console.error(`Error: ${error}`);
        textResponse = `Hệ thống quá tải, thử lại sau. (ERROR: ${error})`
    }

    res.json({
        answer: textResponse
    });
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})