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
  console.log("M-PESA CALLBACK:", JSON.stringify(req.body));

  const stkCallback = req.body.Body?.stkCallback;

  if (stkCallback?.ResultCode === 0) {
    const items = stkCallback.CallbackMetadata.Item;
    const amount = items.find(i => i.Name === 'Amount').Value;
    const phone = items.find(i => i.Name === 'PhoneNumber').Value;

    // Credit user in Supabase
    const { error } = await supabase.rpc('credit_user', { 
      p_phone: phone.toString(), 
      p_amount: amount 
    });
    
    if (error) console.log("DB Error:", error);
    else console.log(`Credited ${amount} to ${phone}`);
  } else {
    console.log("Payment Failed or Cancelled:", stkCallback?.ResultDesc);
  }
  
  res.json({ ResultCode: 0, ResultDesc: "Success" }); // Must respond 200 to Safaricom
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
