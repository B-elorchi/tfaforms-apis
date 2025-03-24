const express = require("express");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const server = express();

const cors = require("cors");


const port = process.env.PORT || 5005;
const swaggerSpec = require("./src/config/swagger");
const authRoutes = require("./src/routes/authRoutes");
const produitRoutes = require("./src/routes/ProductRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const zoneRoutes = require("./src/routes/zoneRoutes");
const villeRoutes = require("./src/routes/villeRoutes");
const listeInterRoutes = require("./src/routes/listeInterRoutes");
const indiceRoutes = require("./src/routes/indiceRoutes");
const demandesRoutes = require("./src/routes/demandesRoutes");
const recapRoutes = require("./src/routes/RecapRoutes");
const VenteRoutes = require("./src/routes/venteRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const usersRoutes = require("./src/routes/usersRoutes");
const receptionsRouter = require("./src/routes/receptionRoutes");
const retourRouter = require("./src/routes/RetourRoutes");
const categoryRouter = require("./src/routes/categoryRoutes");
const rppRoutes = require("./src/routes/rppRoutes");
const avoirRoutes = require("./src/routes/avoirRoutes");
const prixIndiceRoutes = require("./src/routes/prixIndiceRoutes");
const invenataireRoutes = require("./src/routes/inventaireRoutes");
server.use(express.json());

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin); // Debug origin
    if (
      !origin || // Allow server-to-server requests
      /^http:\/\/localhost:\d+$/.test(origin) || // Allow localhost
      /^https:\/\/africabis-api\.onrender\.com$/.test(origin) || // Production domain
      /^https:\/\/admin\.africabis\.ma$/.test(origin) || // Production domain
      /^https:\/\/app\.africabis\.ma$/.test(origin) || // Vercel deployment
      /^https:\/\/api\.africabis\.ma$/.test(origin) || // api deployment
      /^https:\/\/africabis-v2\.flutterflow\.app$/.test(origin) || // Corrected regex
      /^https:\/\/app\.testfully\.io$/.test(origin) // Allow Testfully origin
    ) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Use CORS middleware
server.use(cors(corsOptions));
server.options("*", cors(corsOptions));

server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
server.use("/auth", authRoutes);
server.use("/produits", produitRoutes);
server.use("/stocks", stockRoutes);
server.use("/zones", zoneRoutes);
server.use("/villes", villeRoutes);
server.use("/listes", listeInterRoutes);
server.use("/indices", indiceRoutes);
server.use("/demandes", demandesRoutes);
server.use("/recap", recapRoutes);
server.use("/ventes", VenteRoutes);
server.use("/transactions", transactionRoutes);
server.use("/users", usersRoutes);
server.use("/receptions", receptionsRouter);
server.use("/retours", retourRouter);
server.use("/categories", categoryRouter);
server.use('/rpp', rppRoutes);
server.use('/avoir',avoirRoutes);
server.use('/prix-indice',prixIndiceRoutes);
server.use("/inventaire", invenataireRoutes);
server.get("/", (req, res) => {
  res.send("Hello World");
});

//testing
const SUPABASE_URL = 'https://ulpertgjkcqzxopricwm.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVscGVydGdqa2NxenhvcHJpY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjI5NDEsImV4cCI6MjA1MTk5ODk0MX0.riWmMSaxfWLFLqAPtpu-nPQdRb8it2264FAnYqPst9k';
const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
