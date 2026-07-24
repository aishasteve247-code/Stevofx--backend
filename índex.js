const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// TEST ROUTE
app.get('/', (req, res) => {
  res.send("Stevofx Backend Running");
});

// M-PESA CALLBACK ROUTE
app.post('/callback', express.json(), async (req, res) => {
  console.log("M-PESA Callback:", req.body);
  res.status(200).json({ message: "Received" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
