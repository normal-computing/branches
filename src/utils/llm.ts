import OpenAI from "openai";

const openai = new OpenAI({
  // The apiKey will default to process.env["OPENAI_API_KEY"]
  // If you want to hardcode the key (not recommended for production):
  // apiKey: 'YOUR_OPENAI_API_KEY'
});

const MAX_RETRIES = 5; // Maximum number of retry attempts
const RETRY_DELAY_BASE = 2000; // Base delay in milliseconds

export async function llm(
  promptContent: string,
  samples: number = 1,
  max_tokens: number = 300
): Promise<string | string[]> {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: promptContent }],
        // model: 'gpt-4-0613',
        // model: 'gpt-3.5-turbo-0613',
        model: "gpt-4",
        max_tokens, // use the parameter value
        n: samples,
        temperature: 0.7, // adjust if necessary
      });

      var response = null;

      if (samples === 1) {
        response = completion.choices[0]["message"]["content"] as string;
      } else {
        response = completion.choices.map(
          (choice) => choice["message"]["content"] as string
        );
      }
      return response;
    } catch (error) {
      console.error("Error calling OpenAI API:", error);

      if (retries < MAX_RETRIES) {
        const delay = Math.pow(2, retries) * RETRY_DELAY_BASE;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
      } else {
        console.error("Max retry attempts reached. Giving up.");
        throw error;
      }
    }
  }

  // If we reach here, it means the maximum number of retries was reached without success
  throw new Error("Exceeded maximum number of retries without successful response.");
}
