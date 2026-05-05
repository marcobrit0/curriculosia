import { ORPCError } from "@orpc/client";
import { type } from "@orpc/server";
import { AISDKError, type UIMessage } from "ai";
import { OllamaError } from "ai-sdk-ollama";
import z, { flattenError, ZodError } from "zod";

import { jobResultSchema } from "@/schema/jobs";
import { type ResumeData, resumeDataSchema } from "@/schema/resume/data";
import { tailorOutputSchema } from "@/schema/tailor";
import { env } from "@/utils/env";

import { aiProcedure, protectedProcedure } from "../context";
import {
  type AICredentialsInput,
  aiCredentialsSchema,
  aiService,
  DEFAULT_MANAGED_MODEL,
  fileInputSchema,
  isPremiumUser,
  resolveAICredentials,
} from "../services/ai";

export const aiRouter = {
  getConfig: protectedProcedure
    .route({
      method: "GET",
      path: "/ai/config",
      tags: ["AI"],
      operationId: "getAiConfig",
      summary: "Get AI configuration for the current user",
      description:
        "Returns whether AI is enabled on this instance, the credential mode (BYO vs. managed), whether a managed key is configured, and whether the current user has Premium access. Requires authentication.",
      successDescription: "The current AI configuration for this user.",
    })
    .output(
      z.object({
        enabled: z.boolean().describe("False when FLAG_DISABLE_AI is set."),
        mode: z
          .enum(["byo", "managed", "both"])
          .describe('How AI requests are credentialed on the server. "managed" and "both" require Premium.'),
        hasManagedKey: z.boolean().describe("Whether OPENROUTER_API_KEY is configured on the server."),
        isPremium: z.boolean().describe("Whether the current user can use managed AI."),
        defaultManagedModel: z.string().describe("Default model identifier used when managed mode requests omit one."),
      }),
    )
    .handler(async ({ context }) => ({
      enabled: !env.FLAG_DISABLE_AI,
      mode: env.FLAG_AI_MODE,
      hasManagedKey: Boolean(env.OPENROUTER_API_KEY),
      isPremium: await isPremiumUser(context.user.id),
      defaultManagedModel: DEFAULT_MANAGED_MODEL,
    })),

  testConnection: aiProcedure
    .route({
      method: "POST",
      path: "/ai/test-connection",
      tags: ["AI"],
      operationId: "testAiConnection",
      summary: "Test AI provider connection",
      description:
        "Validates the AI provider connection. In BYO mode, supply provider/model/apiKey/baseURL; in managed mode (Premium), credentials are sourced from the server. Requires authentication.",
      successDescription: "The AI provider connection was successful.",
    })
    .input(aiCredentialsSchema)
    .errors({
      BAD_GATEWAY: {
        message: "The AI provider returned an error or is unreachable.",
        status: 502,
      },
    })
    .handler(async ({ context, input }) => {
      try {
        const credentials = resolveAICredentials(context.aiMode, input);
        return await aiService.testConnection(credentials);
      } catch (error) {
        if (error instanceof AISDKError || error instanceof OllamaError) {
          throw new ORPCError("BAD_GATEWAY", { message: error.message });
        }

        throw error;
      }
    }),

  parsePdf: aiProcedure
    .route({
      method: "POST",
      path: "/ai/parse-pdf",
      tags: ["AI"],
      operationId: "parseResumePdf",
      summary: "Parse a PDF file into resume data",
      description:
        "Extracts structured resume data from a PDF file using the configured AI provider. The file should be sent as a base64-encoded string. AI credentials are required in BYO mode and ignored in managed mode. Returns a complete ResumeData object. Requires authentication.",
      successDescription: "The PDF was successfully parsed into structured resume data.",
    })
    .input(
      z.object({
        ...aiCredentialsSchema.shape,
        file: fileInputSchema,
      }),
    )
    .errors({
      BAD_GATEWAY: {
        message: "The AI provider returned an error or is unreachable.",
        status: 502,
      },
      BAD_REQUEST: {
        message: "The AI returned an improperly formatted structure.",
        status: 400,
      },
    })
    .handler(async ({ context, input }): Promise<ResumeData> => {
      try {
        const credentials = resolveAICredentials(context.aiMode, input);
        return await aiService.parsePdf({ ...credentials, file: input.file });
      } catch (error) {
        if (error instanceof AISDKError) {
          throw new ORPCError("BAD_GATEWAY", { message: error.message });
        }

        if (error instanceof ZodError) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Invalid resume data structure",
            cause: flattenError(error),
          });
        }
        throw error;
      }
    }),

  parseDocx: aiProcedure
    .route({
      method: "POST",
      path: "/ai/parse-docx",
      tags: ["AI"],
      operationId: "parseResumeDocx",
      summary: "Parse a DOCX file into resume data",
      description:
        "Extracts structured resume data from a DOCX or DOC file using the configured AI provider. The file should be sent as a base64-encoded string along with its media type. AI credentials are required in BYO mode and ignored in managed mode. Returns a complete ResumeData object. Requires authentication.",
      successDescription: "The DOCX was successfully parsed into structured resume data.",
    })
    .input(
      z.object({
        ...aiCredentialsSchema.shape,
        file: fileInputSchema,
        mediaType: z.enum([
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]),
      }),
    )
    .errors({
      BAD_GATEWAY: {
        message: "The AI provider returned an error or is unreachable.",
        status: 502,
      },
      BAD_REQUEST: {
        message: "The AI returned an improperly formatted structure.",
        status: 400,
      },
    })
    .handler(async ({ context, input }) => {
      try {
        const credentials = resolveAICredentials(context.aiMode, input);
        return await aiService.parseDocx({ ...credentials, file: input.file, mediaType: input.mediaType });
      } catch (error) {
        if (error instanceof AISDKError) {
          throw new ORPCError("BAD_GATEWAY", { message: error.message });
        }

        if (error instanceof ZodError) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Invalid resume data structure",
            cause: flattenError(error),
          });
        }

        throw error;
      }
    }),

  chat: aiProcedure
    .route({
      method: "POST",
      path: "/ai/chat",
      tags: ["AI"],
      operationId: "aiChat",
      summary: "Chat with AI to modify resume",
      description:
        "Streams a chat response from the configured AI provider. The LLM can call the patch_resume tool to generate JSON Patch operations that modify the resume. AI credentials are required in BYO mode and ignored in managed mode. Requires authentication.",
    })
    .input(
      type<
        AICredentialsInput & {
          messages: UIMessage[];
          resumeData: ResumeData;
        }
      >(),
    )
    .handler(async ({ context, input }) => {
      try {
        const credentials = resolveAICredentials(context.aiMode, input);
        return await aiService.chat({ ...credentials, messages: input.messages, resumeData: input.resumeData });
      } catch (error) {
        if (error instanceof AISDKError || error instanceof OllamaError) {
          throw new ORPCError("BAD_GATEWAY", { message: error.message });
        }

        throw error;
      }
    }),

  tailorResume: aiProcedure
    .route({
      method: "POST",
      path: "/ai/tailor-resume",
      tags: ["AI"],
      operationId: "tailorResume",
      summary: "Auto-tailor resume for a job posting",
      description:
        "Uses AI to automatically tailor a resume for a specific job posting. Rewrites the summary, adjusts experience descriptions, and curates skills for ATS optimization. Returns structured modifications as a simplified output object. AI credentials are required in BYO mode and ignored in managed mode. Requires authentication.",
      successDescription: "Structured tailoring output returned successfully.",
    })
    .input(
      z.object({
        ...aiCredentialsSchema.shape,
        resumeData: resumeDataSchema,
        job: jobResultSchema,
      }),
    )
    .output(tailorOutputSchema)
    .errors({
      BAD_GATEWAY: {
        message: "The AI provider returned an error or is unreachable.",
        status: 502,
      },
      BAD_REQUEST: {
        message: "The AI returned an improperly formatted structure.",
        status: 400,
      },
    })
    .handler(async ({ context, input }) => {
      try {
        const credentials = resolveAICredentials(context.aiMode, input);
        return await aiService.tailorResume({ ...credentials, resumeData: input.resumeData, job: input.job });
      } catch (error) {
        if (error instanceof AISDKError || error instanceof OllamaError) {
          throw new ORPCError("BAD_GATEWAY", { message: error.message });
        }

        if (error instanceof ZodError) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Invalid resume data structure",
            cause: flattenError(error),
          });
        }

        throw error;
      }
    }),
};
