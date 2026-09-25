import app from "./app.js";

// Port can be overridden with the PORT environment variable.
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Real Estate Network API listening on http://localhost:${PORT}`);
});
