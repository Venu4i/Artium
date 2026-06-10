import fs from "fs";

import speech from "@google-cloud/speech";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const speechClient = new speech.SpeechClient({
  keyFilename: "./speech-key.json"
});

//VOICE → TEXT

export const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file required"
      });
    }

    const audioBytes = fs
      .readFileSync(req.file.path)
      .toString("base64");

    const request = {
      audio: {
        content: audioBytes
      },

      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "en-US"
      }
    };

    const [response] =
      await speechClient.recognize(request);

    const transcript = response.results
      .map(
        result =>
          result.alternatives[0].transcript
      )
      .join(" ");

    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      transcript
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Speech conversion failed"
    });
  }
};

//ART FEEDBACK

export const getArtFeedback = async (req,res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description required"
      });
    }

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

    const prompt = `
You are an expert art mentor.

Analyze this artwork description:

"${description}"

Return ONLY valid JSON:

{
  "mood": "",
  "strengths": ["","",""],
  "suggestions": ["","",""],
  "titleIdeas": ["","",""],
  "caption": "",
  "hashtags": ["","","","",""]
}
`;

    const result =
      await model.generateContent(prompt);

    const raw =
      result.response.text();

    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed =
      JSON.parse(clean);

    return res.status(200).json({
      success: true,
      data: parsed
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Failed generating feedback"
    });
  }
};