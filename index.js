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
Mapa ma wymiary 4x4. Piloci zawsze zaczynają od punktu (0,0), który oznaczone jest jako "Start". Następnie wykonują ciągłe ruchy po mapie. Oto jak wygląda mapa:

Row 0: ["Start", "łąka", "drzewo", "dom"]
Row 1: ["łąka", "młyn", "łąka", "łąka"]
Row 2: ["łąka", "łąka", "kamienie", "dwa drzewa"]
Row 3: ["skały", "skały", "auto", "jaskinia"]

Po otrzymaniu instrukcji, poruszaj się po mapie w następujący sposób:
1. Rozpocznij od bieżącej pozycji, którą należy śledzić.
2. Wykonaj każdy ruch zgodnie z instrukcją, pamiętając, że zaczynasz od punktu, w którym skończyłeś poprzedni ruch.
3. Po zakończeniu ruchów, odpowiedz **tylko nazwą pola**, na którym znajduje się dron. Odpowiedź nie powinna zawierać żadnych dodatkowych informacji, opisów czy słów — tylko jedno pole w jednym słowie, np. "łąka".

**Odpowiedź powinna być maksymalnie dwoma słowami, bez dodatkowych szczegółów.**

Przykład:
Instrukcja: "Poleciałem jedno pole w prawo, potem dwa w dół"
- Zacznij w punkcie (0,0), przejdź do (0,1), potem do (1,1) i na koniec do (2,1).
- Wynik: "łąka"

Przykład 2:
Instrukcja: "Poleciałem jedno pole w lewo, potem jedno w górę"
- Zacznij w punkcie (0,0), przejdź do (0,-1), a potem w górę.
- Wynik: "trawa"


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