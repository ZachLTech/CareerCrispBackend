"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai");
const cors = require('cors');
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
// Dotenv init
dotenv_1.default.config();
// Important Variables
const app = (0, express_1.default)();
const port = process.env.PORT;
const key = process.env.KEY;
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
function saturatePrompt(prompt, bio) {
    prompt = prompt.replace(/\[bio\]/g, bio);
    return prompt;
}
/********************************************************************************************/
// Main AI Generation Function
function generateJSON(bio, roastIntensity) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Reads proper prompt file depending on subject and sets a subject variable equal to the filepath without .txt extension
            let prompt = fs_1.default.readFileSync(("./prompts/" + roastIntensity + ".txt"), { "encoding": "utf-8" });
            // function call to make prompt actually good with the user inputted values
            prompt = saturatePrompt(prompt, bio);
            // Init Gemini w/ api key from .env and setting AI model
            const genAI = new generative_ai_1.GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            // Gets result from AI and returns it (next 4 lines found in Google's documentation)
            const result = yield model.generateContent(prompt);
            const response = yield result.response;
            let questions = JSON.parse(response.text());
            // Returns the restringified JSON (idk if that's a word)
            return JSON.stringify(questions);
        }
        catch (error) {
            // Properly catches error with error type safety
            let message;
            if (error instanceof Error)
                message = error.message;
            else
                message = String(error);
            // returns error.. so sad :(
            return ({
                "success": "false",
                "roast": "there was an error - skibidi (My brain farted)",
                "tips": "error",
                "error": message,
                // To not break frontend parsing while also telling the user there's been an error
            });
        }
    });
}
/********************************************************************************************
 * ------------------------------------Request Handlers-------------------------------------*
 ********************************************************************************************/
app.use(express_1.default.json());
// Main
app.post("/roast/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get variables from post body
    const bio = req.body.bio;
    const roastIntensity = req.body.roastIntensity;
    // API wouldn't wait for response before - now it does with 'await' thankfully (async carrying)
    let result = yield generateJSON(bio, roastIntensity);
    res.send(result);
}));
// Funny
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.send({
        "success": "Less successful than a skibidi toilet on sunday",
        "message": "why is cuz looking at my root directory >:( no successful rizzitry in sight",
        "funny": `yk what?? I know who you are lil bro (you not a chill guy): ${ip}`
    });
}));
// Start Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
