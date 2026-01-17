
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

async function listModels() {
  try {
    const files = fs.readdirSync(process.cwd());
    const keyFile = files.find(f => f.startsWith('gen-lang-client') && f.endsWith('.json'));

    if (!keyFile) {
      console.error('Service account key file not found');
      return;
    }

    const auth = new GoogleAuth({
      keyFile: path.join(process.cwd(), keyFile),
      scopes: ['https://www.googleapis.com/auth/generative-language'],
    });

    const client = await auth.getClient();
    const result = await client.request({
      url: 'https://generativelanguage.googleapis.com/v1beta/models',
    });

    console.log('Available Models:');
    result.data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName}): ${model.supportedGenerationMethods}`);
    });

  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
