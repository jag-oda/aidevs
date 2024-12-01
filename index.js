const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Heroku wymaga użycia dynamicznego portu

app.use(express.json());

app.post('/process', (req, res) => {
    // Odczytanie danych z body zapytania (JSON)
    const { instruction } = req.body;
  
    // Logowanie odebranych danych
    console.log('Otrzymana instrukcja:', instruction);
  
    // Przykładowa odpowiedź
    const response = {
      description: 'Przykładowy opis',  // Zastąp tym, co chcesz odesłać
    };
  
    // Wysłanie odpowiedzi w formacie JSON
    res.json(response);
  });

// Trasa główna
app.get('/', (req, res) => {
    res.send('Hello, World!'); // Możesz tu dodać coś bardziej zaawansowanego
  });


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
