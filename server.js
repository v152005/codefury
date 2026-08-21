const app = require("./app");
require("./config/firebase");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Firebase Admin initialized");
});