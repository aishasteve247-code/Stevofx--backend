const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.json());
app.use(cors());

// SUPABASE CONNECTION
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/', (req, res) => {
  res.json({ message: 'Stevofx Backend is Live' });
});

// M-PESA STK PUSH
app.post('/stkpush', async (req, res) => {
  res.json({ message: 'STK Push endpoint ready' });
});

// M-PESA CALLBACK
app.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body.Body.stkCallback;
    
    if(callbackData.ResultCode === 0){
      const items = callbackData.CallbackMetadata.Item;
      const amount = items.find(i => i.Name === 'Amount').Value;
      const phone = items.find(i => i.Name === 'PhoneNumber').Value;
      const phoneStr = phone.toString();

      const { data: user } = await supabase.from('users').select('balance').eq('phone', phoneStr).single();
      const newBalance = Number(user.balance) + Number(amount);
      
      await supabase.from('users').update({ balance: newBalance }).eq('phone', phoneStr);
      
      console.log(`Credited ${amount} to ${phoneStr}. New balance: ${newBalance}`);
    }
    res.json({ResultCode: 0, ResultDesc: "Success"});
  } catch(e){
    console.log(e);
    res.json({ResultCode: 1, ResultDesc: "Failed"});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
