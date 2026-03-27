const express = require('express');
const cors = require('cors');
require('dotenv').config();
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// PROFESSIONALLY ROUTED ENDPOINTS
app.use('/api', contactRoutes);
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`VITS Corporate Backend running at http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop other backend instances and run again.`);
    } else {
        console.error('Server startup failed:', err.message);
    }
    process.exit(1);
});
