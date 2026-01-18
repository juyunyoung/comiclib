import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

// Helper to get access token
const getAccessToken = async () => {
  try {
    const files = fs.readdirSync(process.cwd());
    const keyFile = files.find(f => f.startsWith('gen-lang-client') && f.endsWith('.json'));

    if (!keyFile) {
      console.error('Service account key file not found');
      return null;
    }

    const auth = new GoogleAuth({
      keyFile: path.join(process.cwd(), keyFile),
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/generative-language'
      ],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    return accessToken.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'gemini-auth-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url.startsWith('/api/gemini')) {
              const token = await getAccessToken();
              if (token) {
                req.headers['authorization'] = `Bearer ${token}`;
              } else {
                console.warn('Failed to inject Authorization header for Gemini API');
              }
            }
            next();
          });
        },
      },
    ],
    server: {
      proxy: {
        '/api/naver': {
          target: 'https://openapi.naver.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/naver/, ''),
          headers: {
            'X-Naver-Client-Id': env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET,
          },
        },
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
        },
        '/api': {
          target: 'http://127.0.0.1:5500',
          changeOrigin: true,
        },
      },
    },
  };
})
