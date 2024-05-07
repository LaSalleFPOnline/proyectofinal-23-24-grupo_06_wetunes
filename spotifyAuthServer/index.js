require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "http://localhost:8888/callback";

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: new URLSearchParams({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      }
    });
    res.redirect(`http://localhost:8100?access_token=${response.data.access_token}`);
  } catch (error) {
    res.send(`Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
