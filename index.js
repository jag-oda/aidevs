const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000; // Heroku wymaga użycia dynamicznego portu



app.use(express.json());

// Wczytanie klucza API z pliku .key w tym samym katalogu
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error('OpenAI API key not found!');
}

const openai = new OpenAI({
    apiKey: openaiApiKey,
  });


// Funkcja do zapytania LLM
async function getLLMResponse(instructions) {
  const prompt = `Zrozum polecenie i opisz miejsce docelowe: "${instructions}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Wybierz odpowiedni model OpenAI
      messages: [
        {
          role: 'system',
          content: 'Jesteś asystentem pomagającym w rozumieniu instrukcji lokalizacyjnych.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Zwracamy odpowiedź LLM
    return completion.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Błąd podczas zapytania do OpenAI:", error);
    throw new Error('Błąd podczas przetwarzania zapytania');
  }
}

// Endpoint POST, który przyjmuje instrukcje i wysyła zapytanie do LLM
app.post('/instruction', async (req, res) => {
  const instructions = req.body.instruction;
    console.log('instruction', instructions)
  if (!instructions) {
    return res.status(400).json({ error: "Brak instrukcji w zapytaniu" });
  }

  try {
    const description = await getLLMResponse(instructions);

    // Odpowiedz na zapytanie z opisem
    return res.json({ description: description });
  } catch (error) {
    console.error("Błąd w przetwarzaniu instrukcji:", error);
    return res.status(500).json({ error: "Błąd podczas przetwarzania zapytania" });
  }
});

// Uruchomienie serwera
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});