import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function readTextFile(filePath) {
  try {
    const absolutePath = path.resolve(__dirname, filePath);
    const text = await fs.promises.readFile(absolutePath, 'utf-8');
    // Remove any special characters that might cause issues
    return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  } catch (error) {
    console.error('Error reading text file:', error);
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}

async function convertTextToSpeech(text, outputFileName = "speech.mp3", voice = "onyx") {
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const speechFile = path.join(outputDir, outputFileName);
    
    console.log('Converting text to speech...');
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: voice,
      input: text,
      instructions: "Voice Affect: Low, and suspenseful; convey tension and intrigue. Tone: Deeply serious, maintaining an undercurrent of unease throughout. Pacing: deliberate, pausing slightly after suspenseful moments to heighten drama. Emotion: Restrained yet intense—voice. Emphasis: Highlight sensory descriptions (footsteps echoed, heart hammering, shadows melting into darkness) to amplify atmosphere. Pronunciation: Slightly elongated vowels and softened consonants.",
    });

    console.log('Writing audio file...');
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    
    console.log(`Audio file saved successfully at: ${speechFile}`);
    return speechFile;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
}

// Get command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3] || "speech.mp3";

if (!inputFile) {
  console.error('Please provide an input text file path.');
  console.log('Usage: node index.js <input-text-file> [output-file-name]');
  process.exit(1);
}

// Main execution
readTextFile(inputFile)
  .then(text => {
    console.log('Text file read successfully. Converting to speech...');
    return convertTextToSpeech(text, outputFile);
  })
  .then(filePath => console.log('Conversion completed!'))
  .catch(error => {
    console.error('Process failed:', error);
    process.exit(1);
  }); 