import express from 'express';
import axios from 'axios';

const app = express();

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || '{YOUR_HOSTED_PYTHON_BACKEND_URL}';

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/api/*', async (req, res) => {
  try {
    const targetUrl = `${PYTHON_BACKEND_URL}${req.originalUrl}`;

    const config = {
      method: req.method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: new URL(PYTHON_BACKEND_URL).host,
      },
      params: req.query,
      timeout: 60000,
      validateStatus: () => true,
    };

    delete config.headers['host'];
    delete config.headers['connection'];

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      config.data = req.body;
    }

    const response = await axios(config);

    Object.entries(response.headers).forEach(([key, value]) => {
      if (!['connection', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: 'Backend service unavailable',
        message: 'Cannot connect to Python backend. Please check PYTHON_BACKEND_URL.',
        backend: PYTHON_BACKEND_URL
      });
    } else {
      res.status(500).json({
        error: 'Proxy error',
        message: error.message
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    proxy_target: PYTHON_BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

export default app;
