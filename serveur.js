const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());

// Schéma du produit
const produitSchema = new mongoose.Schema({
  nom: String,
  prix: Number,
  sport: String,
  quantite: Number
});

// Modèle du produit basé sur le schéma
const Produit = mongoose.model('Produit', produitSchema);

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

// Route pour ajouter un produit
app.post('/api/produits', (req, res) => {
  const { nom, prix, sport, quantite } = req.body;

  // Création d'une nouvelle instance du modèle Produit
  const nouveauProduit = new Produit({
    nom: nom,
    prix: prix,
    sport: sport,
    quantite: quantite
  });

  // Enregistrement du nouveau produit dans la base de données
  nouveauProduit.save()
    .then(() => {
      res.status(201).json({ message: 'Produit ajouté avec succès' });
    })
    .catch((error) => {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Error adding product' });
    });
});

// Route pour récupérer tous les produits
app.get('/api/produits', (req, res) => {
  Produit.find()
    .then((produits) => {
      res.json(produits);
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Error fetching products' });
    });
});

// Route pour récupérer un produit par son ID
app.get('/api/produits/:id', (req, res) => {
  const { id } = req.params;

  Produit.findById(id)
    .then((produit) => {
      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json(produit);
    })
    .catch((error) => {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Error fetching product' });
    });
});

// Route pour mettre à jour un produit
app.put('/api/produits/:id', (req, res) => {
  const { id } = req.params;
  const { nom, prix, sport } = req.body;

  Produit.findByIdAndUpdate(id, { nom, prix, sport }, { new: true })
    .then((produit) => {
      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json(produit);
    })
    .catch((error) => {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
    });
});

// Route pour supprimer un produit
app.delete('/api/produits/:id', (req, res) => {
  const { id } = req.params;

  Produit.findByIdAndRemove(id)
    .then((produit) => {
      if (!produit) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }
      res.json({ message: 'Produit supprimé avec succès' });
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Error deleting product' });
    });
});

// Démarrage du serveur et écoute des requêtes entrantes
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
