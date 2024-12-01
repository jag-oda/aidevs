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
    Twoim zadaniem jest zrozumienie mapy i odpowiedzenie na pytania na podstawie opisanego ruchu drona na mapie 4x4. Mapa wygląda następująco:

Start, łąka, drzewo, dom
Łąka, młyn, łąka, łąka
Łąka, łąka, kamienie, dwa drzewa
Skały, skały, auto, jaskinia

Piloci zawsze zaczynają lot od punktu (0,0) (oznaczonego jako "Start") i poruszają się na mapie w sposób ciągły. Kiedy otrzymasz instrukcję, nie zaczynaj ruchu od punktu (0,0) za każdym razem, ale traktuj każdy kolejny ruch jako sekwencyjny od ostatniej pozycji. Na przykład:

- Jeśli otrzymasz instrukcję "poleciałem jedno pole w prawo, potem dwa w dół", zacznij od pozycji (0,0), potem wykonaj ruch w prawo do (0,1), a następnie wykonaj dwa ruchy w dół, czyli: (0,1) -> (1,1) -> (2,1). Na tej pozycji, wynikowym obszarem będzie "łąka", a nie "młyn".

Twoim zadaniem jest podanie, na jakim polu znajduje się dron po wykonaniu wszystkich ruchów.

Pamiętaj, że mapa ma następujący układ:

Row 0: ["Start", "łąka", "drzewo", "dom"]
Row 1: ["Łąka", "młyn", "łąka", "łąka"]
Row 2: ["Łąka", "łąka", "kamienie", "dwa drzewa"]
Row 3: ["Skały", "skały", "auto", "jaskinia"]

Podaj tylko nazwę obszaru, na którym znajduje się dron po wykonaniu wszystkich ruchów.

Poniżej znajdują się przykłady:

Instrukcja: "Poleciałem jedno pole w prawo, potem dwa w dół"
Odpowiedź: "łąka"

Zwróć tylko odpowiedź. 

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