const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000; // Heroku wymaga użycia dynamicznego portu



app.use(express.json());

// Wczytanie klucza API z pliku .key w tym samym katalogu
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });


// Funkcja do zapytania LLM
async function getLLMResponse(instruction) {
    // Prompt z mapą i instrukcjami
    const prompt = `
     Masz przed sobą mapę 4x4, na której piloci rozpoczynają swoje loty zawsze od punktu startowego (0,0). Każdy kolejny ruch odbywa się w sposób ciągły, tzn. po każdym ruchu aktualna pozycja zmienia się w zależności od poprzednich instrukcji. Oto jak wygląda mapa:

    1. Wiersz 1: Start, Trawa, Drzewo, Dom
    2. Wiersz 2: Łąka, Młyn, Łąka, Łąka
    3. Wiersz 3: Łąka, Łąka, Kamienie, Dwa drzewa
    4. Wiersz 4: Skały, Skały, Auto, Jaskinia

    Każdy ruch na mapie odbywa się w jednym z czterech kierunków:
    - W prawo (np. Trawa -> Drzewo)
    - W dół (np. Trawa -> Łąka)

    Ruchy mogą być złożone, co oznacza, że każde kolejne pole to kontynuacja poprzedniego ruchu. Na przykład, jeśli instrukcja mówi "Poleciałem jedno pole w prawo, potem dwa w dół", oznacza to:
    1. Rozpoczynasz w punkcie "Start" (0,0).
    2. Pierwszy ruch to pole w prawo: "Start" -> "Trawa".
    3. Drugi ruch to jedno pole w dół: "Trawa" -> "Łąka".
    4. Trzeci ruch to kolejne jedno pole w dół: "Łąka" -> "Młyn".

    Instrukcja:
    ${instruction}

    Twoje zadanie to określenie, w jakim miejscu na mapie znajduje się dron po wykonaniu ruchów opisanych w instrukcji. Opisz to miejsce w maksymalnie dwóch słowach, uwzględniając aktualną pozycję na mapie.
    `;
  
    try {
      // Wywołanie OpenAI API w celu uzyskania odpowiedzi na podstawie mapy
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Wybór modelu GPT-3.5
        messages: [{ role: "system", content: prompt }],
      });
  
      // Oczekiwana odpowiedź
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error while fetching the response from OpenAI:", error);
      throw new Error("Błąd podczas przetwarzania zapytania");
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