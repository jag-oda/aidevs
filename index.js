const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Heroku wymaga użycia dynamicznego portu

app.use(express.json());

app.post('/drone', (req, res) => {
  const instruction = req.body.instruction;
  
  // Przykładowe działanie: zwróć "skały" niezależnie od instrukcji
  res.json({ description: 'skały' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
