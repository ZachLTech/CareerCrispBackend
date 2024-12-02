import express, { Express, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
const cors = require('cors');
import dotenv from "dotenv";
import fs from "fs";

// Dotenv init
dotenv.config();
// Important Variables
const app: Express = express();
const port = process.env.PORT;
const key: string = process.env.KEY as string; 

/********************************************************************************************
 * ------------------------------------------CORS-------------------------------------------*
 ********************************************************************************************/
// UNCOMMENT WHEN REVERSE PROXY IS SETUP AND ITS UP
// CORS is weird and idk it that well but this basically is good for security and lets our API only be called by our domain and localhost when developing

// Langchain Impl
// import { ChatOpenAI } from "langchain/chat_models/openai";

// const llm = new ChatOpenAI();
// await llm.invoke("Hello, world!");

// let corsOptions = {
//   origin : ['https://careercrisp.vercel.app']
// };
// app.use(cors(corsOptions));
app.use(cors());

/********************************************************************************************
 * ---------------------------------------Functions-----------------------------------------*
 ********************************************************************************************/

// Saturates the default subject prompt with the proper user inputted values and returns to be sent off to AI
function saturatePrompt(prompt: string, bio: string){
  prompt = prompt.replace(/\[bio\]/g, bio);
  return prompt;
}

/********************************************************************************************/

// Main AI Generation Function
async function generateJSON(bio: string, roastIntensity: string) {
  try{
    // Reads proper prompt file depending on subject and sets a subject variable equal to the filepath without .txt extension
    let prompt = fs.readFileSync(("./prompts/" + roastIntensity + ".txt"), {"encoding": "utf-8"});
    // function call to make prompt actually good with the user inputted values
    prompt = saturatePrompt(prompt, bio);
    // Init Gemini w/ api key from .env and setting AI model
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // Gets result from AI and returns it (next 4 lines found in Google's documentation)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questions = JSON.parse(response.text());
    // Returns the restringified JSON (idk if that's a word)
    return JSON.stringify(questions);
  }
  catch (error){
    // Properly catches error with error type safety
    let message
    if (error instanceof Error) message = error.message
    else message = String(error)
    // returns error.. so sad :(
    return ({
      "success": "false",
      "roast": "there was an error - skibidi (My brain farted)",
      "tips": "error",
      "error": message,
      // To not break frontend parsing while also telling the user there's been an error
    });
  }
}

/********************************************************************************************
 * ------------------------------------Request Handlers-------------------------------------*
 ********************************************************************************************/

app.use(express.json());

// Main
app.post("/roast/", async (req: Request, res: Response) => {
  // Get variables from post body
  const bio: string = req.body.bio;
  const roastIntensity: string = req.body.roastIntensity;
  // API wouldn't wait for response before - now it does with 'await' thankfully (async carrying)
  let result = await generateJSON(bio, roastIntensity);
  res.send(result);
});
// Funny
app.get("/", async (req: Request, res: Response) => {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.send({
    "success": "Less successful than a skibidi toilet on sunday",
    "message": "why is cuz looking at my root directory >:( no successful rizzitry in sight",
    "funny": `yk what?? I know who you are lil bro (you not a chill guy): ${ip}`
  });
});

// Start Server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});