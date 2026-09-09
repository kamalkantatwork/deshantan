const mongoose = require('mongoose');
const uri = 'mongodb+srv://testuser:test123@deshantan.r29i2p7.mongodb.net/deshantan';

mongoose.connect(uri)
.then(() => { 
    console.log('✅ SUCCESS! Connected to MongoDB'); 
    process.exit(0); 
})
.catch(err => { 
    console.log('❌ Error:', err.message); 
    process.exit(1); 
});