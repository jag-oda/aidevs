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
Masz przed sobą mapę 4x4, na której piloci rozpoczynają swoje loty zawsze od punktu startowego, znajdującego się w lewym górnym rogu (0,0). Każdy element na mapie ma swoją specyficzną nazwę. Oto jak wygląda mapa:

Start   | Trawa   | Drzewo  | Dom
Łąka    | Młyn    | Łąka    | Łąka
Łąka    | Łąka    | Kamienie| Dwa drzewa
Skały   | Skały   | Auto    | Jaskinia

Każde pole na mapie oznacza różne elementy, jak "Trawa", "Łąka", "Drzewo", "Dom" i inne. Na przykład, pole w lewym górnym rogu to "Start", gdzie zaczyna się lot. Możesz wyobrazić sobie mapę jako siatkę 4x4, w której każdy wiersz i każda kolumna ma określoną nazwę:

1. Wiersz 1: Start, Trawa, Drzewo, Dom
2. Wiersz 2: Łąka, Młyn, Łąka, Łąka
3. Wiersz 3: Łąka, Łąka, Kamienie, Dwa drzewa
4. Wiersz 4: Skały, Skały, Auto, Jaskinia

Zawsze zaczynasz od punktu START, czyli (0,0). Każda instrukcja zawiera listę ruchów, które wykonujesz zaczynając od punktu START, a następnie przesuwasz się o odpowiednią liczbę pól w lewo, prawo, w górę lub w dół. Pamiętaj, że po każdym ruchu twój aktualny punkt jest kolejnym "startem" dla następnego ruchu, a kolejne pole liczy się już od miejsca, w którym jesteś po poprzednich ruchach.

Instrukcja:
${instruction}

Ważne zasady:
1. Jeśli mówi się, że "lecimy na sam dół mapy", oznacza to, że należy przejść do ostatniego wiersza (ruch w dół o 3 pola).
2. Jeśli mówi się, że "lecisz w prawo", oznacza to ruch w prawo o 1 pole, chyba że jest inaczej określone.
3. W "korekta o jedno pole do góry" chodzi o ruch w górę o 1 pole.
4. Twoje zadanie to zrozumienie, ile pól w określoną stronę dron powinien polecieć, na przykład:
   - "Poleciałem na sam dół mapy" → ruch 3 pola w dół.
   - "Potem ile tylko możemy polecimy w prawo" → tak długo jak to możliwe, czyli do ostatniej kolumny.
   - "Teraz mała korekta o jedno pole do góry" → przesunięcie o jedno pole do góry.

Po wykonaniu instrukcji wskaż, gdzie znajduje się dron. Opisz to miejsce w maksymalnie dwóch słowach.


 `;
  
    try {
      // Wywołanie OpenAI API w celu uzyskania odpowiedzi na podstawie mapy
      const response = await openai.chat.completions.create({
        model: "gpt-4", // Wybór modelu GPT-3.5
        messages: [{ role: "system", content: prompt }],
      });
  
      // Oczekiwana odpowiedź
      console.log("ODPOWIEDŹ", response.choices[0].message.content.trim() )
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