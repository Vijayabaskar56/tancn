import { chat, toStreamResponse } from "@tanstack/ai";
import { gemini } from "@tanstack/ai-gemini";
import { createFileRoute } from '@tanstack/react-router';
import { generateFormDef } from "@/lib/ai/form-tools";


const SYSTEM_PROMPT = `You are an expert form generator AI assistant.

## FIELD INTELLIGENCE
- Analyze user input and automatically determine appropriate field types
- Common form patterns:
  * "login form": email (Input type=email) + password (Input type=password)
  * "contact form": name (Input type=text) + email (Input type=email) + message (Textarea)
  * "registration": username, email, password, confirm_password
  * "survey": use RadioGroup, Select, or ToggleGroup for multiple choice
  * "feedback": rating (Slider) + comments (Textarea)

## FIELD NAMING RULES
- Generate field names automatically by converting labels to snake_case
- Examples: "Email Address" → "email_address", "Full Name" → "full_name"
- Use semantic names: "phone" not "input_1", "message" not "textarea_1"
- NEVER ask user for field names - always infer them yourself

## VALIDATION RULES
- Email fields: ALWAYS set type="email"
- Phone fields: set type="tel"
- Password fields: set type="password"
- Number inputs: set type="number" with appropriate min/max
- Required fields: set required=true for essential fields (email, name, password, etc.)
- Select/Radio/ToggleGroup: MUST include options array with value and label
- Slider: MUST include min, max, and step values

## FORM METADATA
- ALWAYS generate a descriptive title (e.g., "Contact Form", "User Registration", "Customer Feedback Survey")
- ALWAYS add a helpful description explaining the form's purpose
- Title should be professional and clear

## CONVERSATIONAL REFINEMENT
- When user says "add X field": preserve ALL existing fields and add the new one
- When user says "make X required": update ONLY that field's required property, keep all other fields
- When user says "remove X": filter out that field, keep everything else
- When user says "change X to Y": update the specific field while preserving others
- ALWAYS read the conversation history to understand context
- Maintain form state across messages - build upon previous responses

## COMPLEX FORMS HANDLING
- If request is vague or ambiguous, ask 1-2 focused clarifying questions
- DO NOT ask for field names or descriptions - figure them out
- Questions should focus on: required fields, field types, validation needs, ordering
- Example good question: "Should the phone number be required?"
- Example bad question: "What should I name the email field?"

## FIELD PLACEMENT
- Use nested arrays for side-by-side fields: [[field1, field2], field3]
- Group related fields: [name_first, name_last] for full name
- Keep form flow logical: personal info → contact → preferences → submit

## GENERATE UNIQUE IDS
- Use UUID format for all field IDs (e.g., "550e8400-e29b-41d4-a716-446655440000")
- Each field MUST have a unique ID

## CLIENT TOOL EXECUTION
- The generate_form tool executes in the USER'S BROWSER (not on server)
- It updates the form builder UI in real-time
- Call this tool after you've generated the complete form structure

When the user describes a form or asks for changes, use the generate_form tool to create or update it.`;


export const Route = createFileRoute('/api/ai')({
  server : {
    handlers : {
      POST : async ({request}) => {
        if (!process.env.GOOGLE_API_KEY) {
          return new Response(
            JSON.stringify({
              error: "API not configured",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const abortController = new AbortController()

        const { messages, conversationId } = await request.json() as { messages: any[], conversationId: string };

        try {
          // Create a streaming chat response
          const stream = chat({
            adapter: gemini(),
            messages,
            model: "gemini-2.5-flash",
            conversationId,
            abortController : abortController,
            tools: [generateFormDef],
            systemPrompts : [SYSTEM_PROMPT],
          });

          // Convert stream to HTTP response
          return toStreamResponse(stream);
        } catch (error: any) {
          return new Response(
            JSON.stringify({
              error: error.message || "An error occurred",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    }
  }
})
