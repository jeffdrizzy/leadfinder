const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let leads = [];

app.post('/api/save', (req, res) => {
  const { title, subreddit, url, snippet } = req.body;
  leads.push({ title, subreddit, url, snippet, timestamp: new Date() });
  res.json({ success: true });
});

app.get('/api/leads', (req, res) => res.json(leads));

app.get('/api/search', async (req, res) => {
  const { q = 'plumber' } = req.query;
  try {
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=25`);
    const data = await response.json();
    const posts = data.data.children.map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      url: `https://reddit.com${post.data.permalink}`,
      snippet: (post.data.selftext || '').substring(0, 200)
    }));
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Running on port ${PORT}`));
