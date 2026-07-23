
app.post('/callback', express.json(), async (req, res) => {
  console.log("M-PESA CALLBACK:", JSON.stringify(req.body));
  
  const stkCallback = req.body.Body?.stkCallback;
  
  if (stkCallback?.ResultCode === 0) {
    const items = stkCallback.CallbackMetadata.Item;
    const amount = items.find(i => i.Name === 'Amount').Value;
    const phone = items.find(i => i.Name === 'PhoneNumber').Value;
    
    // Credit user in Supabase
    const { error } = await supabase.rpc('credit_user', { p_phone: phone.toString(), p_amount: amount });
    if (error) console.log("DB Error:", error);
    else console.log(`Credited ${amount} to ${phone}`);
  }
  
  res.json({ ResultCode: 0, ResultDesc: "Success" }); // Must respond 200 to Safaricom
});
