const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://user:user@cluster0.ssiy9ka.mongodb.net/produits', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Route pour récupérer tous les produits
app.get('/api/produits', (req, res) => {
  // Récupérer la référence à la collection "produits"
  const produitsCollection = mongoose.connection.collection('produit');

  // Utiliser la méthode find() pour récupérer tous les documents de la collection
  produitsCollection.find().toArray()
    .then((produits) => {
      // Renvoyer les produits récupérés en tant que réponse JSON brute
      res.json(produits);
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
      // Renvoyer une réponse d'erreur en cas d'échec
      res.status(500).json({ error: 'Error fetching products' });
    });
});

// Autres routes et logique de traitement supplémentaires

// Démarrage du serveur et écoute des requêtes entrantes
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
