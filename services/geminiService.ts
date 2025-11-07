
import { GoogleGenAI, Modality } from "@google/genai";

const VEO_POLLING_INTERVAL_MS = 10000;

const videoLoadingMessages = [
    "Warming up the virtual cameras...",
    "Scouting for the perfect location...",
    "Styling the digital model...",
    "Adjusting the lighting...",
    "The director is calling 'action!'...",
    "Rendering your beautiful reel...",
    "Adding the final touches...",
    "Almost ready for the premiere...",
];

/**
 * Generates a professional photoshoot image.
 * @param base64ImageData The base64 encoded string of the user's abaya image.
 * @param mimeType The MIME type of the user's uploaded image.
 * @param prompt The user's text prompt describing the desired scene.
 * @returns A promise that resolves to the base64 encoded string of the generated image.
 */
// Fix: Add mimeType parameter to support various image formats.
export async function generatePhotoshoot(base64ImageData: string, mimeType: string, prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            // Fix: Use the provided mimeType instead of a hardcoded value.
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error generating photoshoot:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
}

/**
 * Generates a marketing reel video.
 * @param base64ImageData The base64 encoded string of the user's abaya image.
 * @param mimeType The MIME type of the user's uploaded image.
 * @param prompt The user's text prompt describing the video.
 * @param onProgress A callback function to update the loading message in the UI.
 * @returns A promise that resolves to the object URL of the generated video.
 */
// Fix: Add mimeType parameter to support various image formats.
export async function generateReel(base64ImageData: string, mimeType: string, prompt: string, onProgress: (message: string) => void): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    // Create a new instance right before the call to use the latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    onProgress(videoLoadingMessages[0]);
    let messageIndex = 1;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64ImageData,
                // Fix: Use the provided mimeType instead of a hardcoded value.
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16' // Ideal for reels
            }
        });

        const progressInterval = setInterval(() => {
            onProgress(videoLoadingMessages[messageIndex % videoLoadingMessages.length]);
            messageIndex++;
        }, 8000);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, VEO_POLLING_INTERVAL_MS));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        clearInterval(progressInterval);
        
        onProgress("Video generated! Downloading...");

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was found.");
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download the video file. Status: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error generating reel:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
             throw new Error("Your API Key is not valid. Please select a valid key.");
        } else if (error instanceof Error && error.message.includes("Requested entity was not found")) {
            throw new Error("Requested entity was not found. Your API Key may be invalid or missing permissions. Please select it again.");
        }
        throw new Error("Failed to generate video. Please try again.");
    }
}
