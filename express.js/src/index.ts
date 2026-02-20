import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

// Set __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up app and port
const app = express();
const port = process.env.port || 3000;
const sendFileOptions = {
  'root': '../public'
};
app.use(express.static('../public'));

// Index
app.get('/', (req, res) => {
  //es.send(__dirname);
  res.sendFile('./views/index.html', sendFileOptions);
});

// Launch server
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});