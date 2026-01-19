
import { GoogleGenAI, Type } from "@google/genai";
import { File, ClarificationRequest, ProjectConfig, AspectRatio, ImageSize } from '../types';

// Constants for Gemini 3 Models
const MODEL_FLASH = "gemini-3-flash-preview";
const MODEL_PRO = "gemini-3-pro-preview";
const MODEL_IMAGE = "gemini-3-pro-image-preview";

const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
};

export const aiService = {
  
  // Chatbot with Thinking and Image Analysis capabilities
  chat: async (message: string, history: any[], attachment?: string, useThinking?: boolean) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: message }];
    
    // Add image understanding if attachment provided
    if (attachment) {
      // Extract mime type and base64 data correctly
      const matches = attachment.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const config: any = {};
    if (useThinking) {
      // Set maximum thinking budget for Pro as per instructions
      config.thinkingConfig = { thinkingBudget: 32768 };
    }

    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: [...history, { role: 'user', parts }],
      config
    });

    return response.text;
  },

  // Advanced Image Generation
  generateImage: async (prompt: string, aspectRatio: AspectRatio = "1:1", imageSize: ImageSize = "1K"): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: [{ text: prompt }],
      config: { 
        imageConfig: { 
          aspectRatio,
          imageSize
        } 
      }
    });
    
    // Find image part in candidates
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : "";
  },

  generateStep: async (stepId: number, context: any): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const { config, currentFiles, clarificationAnswer } = context;
    
    const fileContext = currentFiles 
      ? `Current Project Files:\n${currentFiles.map((f: any) => `--- ${f.name} ---\n${f.content}`).join('\n\n')}`
      : "";

    // Use Flash for standard fast generation steps
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Project: ${config.name}. Step: ${stepId}. ${fileContext}`,
      config: {
        systemInstruction: "Expert AI agent assistant. Output project files in JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  language: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["name", "language", "content"]
              }
            }
          }
        }
      }
    });

    return JSON.parse(cleanJson(response.text || "{}"));
  },

  getClarificationAnswer: async (request: ClarificationRequest, config: ProjectConfig): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
       model: MODEL_FLASH,
       contents: `Architect Nexus: Resolve this ambiguity for ${config.name}: "${request.question}"`,
    });
    return response.text || "Proceed with standard best practices.";
  },

  refineCode: async (currentFiles: File[], instruction: string, config: ProjectConfig): Promise<File[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fileContext = currentFiles.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n');
    
    // Use Pro for complex refinement tasks
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Refine this code. Project: ${config.name}. Instruction: "${instruction}". Files:\n${fileContext}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // High quality reasoning for edits
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  language: { type: Type.STRING },
                  content: { type: Type.STRING }
                },
                required: ["name", "language", "content"]
              }
            }
          }
        }
      }
    });

    const output = JSON.parse(cleanJson(response.text || "{}"));
    return output.files || [];
  }
};
