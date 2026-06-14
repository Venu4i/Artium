import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const enhanceArtDescription = async (req, res) => {
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
You are an expert art content writer.

Improve this artwork description.

Rules:
- Keep original meaning.
- Make it more professional.
- Suitable for social media art portfolio.
- Maximum 120 words.

Description:
"${description}"

Return ONLY JSON:

{
  "enhancedDescription":""
}
`;

    const result =
      await model.generateContent(prompt);

    const raw =
      result.response.text();

    const clean =
      raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed =
      JSON.parse(clean);

    return res.status(200).json({
      success: true,
      enhancedDescription:
        parsed.enhancedDescription
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to improve description"
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { description, artType, feedbackMode} = req.body;

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
You are a professional creative mentor.

Artwork Description:
${description}

Art Type:
${artType || "Unknown"}

Feedback Mode:
${feedbackMode || "Professional"}

Analyze the creation.

Return ONLY valid JSON.

{
  "artType": "",
  "detectedMood": "",
  "creativityScore": 0,
  "strengths": [
    "",
    "",
    ""
  ],
  "improvements": [
    "",
    "",
    ""
  ],
  "Suggestions": [
    {
      "description": "",
      "resources": "",
      "reason": ""
    }
  ],
  "compositionIdeas": [
    "",
    ""
  ],
  "nextSteps": [
    "",
    ""
  ],
  "titleIdeas": [
    "",
    "",
    ""
  ],
  "caption": "",
  "hashtags": [
    "",
    "",
    "",
    "",
    ""
  ]
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

    const parsed = JSON.parse(clean);

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

const generateArtChallenge = async (req, res) => {
  try {

    const {
      artType,
      description
    } = req.body;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

    const prompt = `
Generate creative challenges.

Art Type:
${artType}

Description:
${description}

Return ONLY JSON.

{
  "easy":"",
  "medium":"",
  "hard":"",
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

    return res.status(200).json({
      success: true,
      data: JSON.parse(clean)
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Challenge generation failed"
    });
  }
};

const generateCreativeIdeas = async (req, res) => {

  try {

    const {
      topic,
      artType
    } = req.body;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

    const prompt = `
Generate 4 original creative ideas.

Topic:
${topic}

Art Type:
${artType}

Return JSON:

{
  "ideas":[
    "",
    "",
    ""
  ]
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

    return res.status(200).json({
      success: true,
      data: JSON.parse(clean)
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Idea generation failed"
    });
  }
};

const generateTags = async (req, res) => {
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
Generate highly relevant art hashtags.

Artwork Description:
"${description}"

Rules:
- No # symbol
- Single words when possible
- Maximum 10 tags

Return ONLY JSON:

{
  "tags":[
    "",
    "",
    ""
  ]
}
`;

    const result =
      await model.generateContent(prompt);

    const raw =
      result.response.text();

    const clean =
      raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed =
      JSON.parse(clean);

    return res.status(200).json({
      success: true,
      tags: parsed.tags
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed generating tags"
    });
  }
};

export {
  getFeedback,
  generateArtChallenge,
  generateCreativeIdeas,
  generateTags,
  enhanceArtDescription
}