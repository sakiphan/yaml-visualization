const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/claude-fix', async (req, res) => {
  const { yamlText, errorMsg } = req.body;
  const prompt = `Aşağıdaki YAML dosyasında hata var. Hata mesajı: ${errorMsg}\nLütfen YAML'ı düzelt ve sadece düzeltilmiş YAML çıktısını ver.\n\nHatalı YAML:\n${yamlText}`;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    console.log('Claude yanıtı:', data);
    res.json(data);
  } catch (err) {
    console.error('Claude proxy hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Proxy server running on http://localhost:3001'));