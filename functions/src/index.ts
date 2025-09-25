import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

// Initialize Firebase Admin
admin.initializeApp();

// Create DOMPurify instance with JSDOM window
const window = new JSDOM("").window;
const purify = DOMPurify(window as unknown as Window);

/**
 * Secure Input Function - Demonstrates input sanitization
 *
 * Usage:
 * POST https://your-region-your-project.cloudfunctions.net/secureInputFunction
 * Body: { "text": "Some user input that might contain <script>alert('xss')</script>" }
 */
export const secureInputFunction = onRequest(
  {
    cors: true,
    region: "us-central1", // Adjust region as needed
  },
  async (request, response) => {
    // Only allow POST requests
    if (request.method !== "POST") {
      response.status(405).json({
        error: "Method not allowed. Use POST.",
      });
      return;
    }

    try {
      // Extract text from request body
      const { text } = request.body;

      // Validate that text was provided
      if (!text || typeof text !== "string") {
        response.status(400).json({
          error: "Missing or invalid 'text' field in request body.",
        });
        return;
      }

      // Log the original input (be careful not to log sensitive data in production)
      logger.info("Original input received", {
        originalLength: text.length,
        timestamp: new Date().toISOString(),
      });

      // Sanitize the input using DOMPurify
      const sanitizedText = purify.sanitize(text, {
        ALLOWED_TAGS: [], // Allow no HTML tags
        ALLOWED_ATTR: [], // Allow no attributes
        KEEP_CONTENT: true, // Keep text content even when removing tags
      });

      // Log the sanitized result
      logger.info("Input sanitized successfully", {
        sanitizedLength: sanitizedText.length,
        wasModified: text !== sanitizedText,
        timestamp: new Date().toISOString(),
      });

      // Example: Further processing could happen here
      // - Store in database
      // - Send to external service
      // - Process business logic

      // Return both original and sanitized for demonstration
      // (In production, you'd typically only return the processed result)
      response.status(200).json({
        success: true,
        data: {
          original: text,
          sanitized: sanitizedText,
          wasModified: text !== sanitizedText,
          processedAt: new Date().toISOString(),
        },
      });

    } catch (error) {
      logger.error("Error in secureInputFunction", { error });

      response.status(500).json({
        error: "Internal server error occurred while processing input.",
      });
    }
  }
);

/**
 * Example health check function
 */
export const healthCheck = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    response.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }
);