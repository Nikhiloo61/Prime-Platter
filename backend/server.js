const path = require("path");
const dotenv = require("dotenv");

// Load local environment variables
dotenv.config({
    path: path.join(__dirname, ".env")
});

// Import Express application
const app = require("../index");

// Start local development server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(
        `Prime Platter running at http://localhost:${PORT}`
    );
});