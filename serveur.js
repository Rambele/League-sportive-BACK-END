const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// Middleware pour permettre à Express de traiter les données JSON
app.use(express.json());



// Schéma de l'utilisateur
const userSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    tel: String,
    email: {
      type: String,
      unique: true,
      required: true
    },
    motDePasse: {
      type: String,
      required: true
    },
    panier: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit'
    }]
  });

// Modèle de l'utilisateur basé sur le schéma
const User = mongoose.model('User', userSchema);

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




//===================================User=====================================
// Route pour ajouter un nouvel utilisateur
app.post('/api/users', async (req, res) => {
    const { nom, prenom, tel, email, motDePasse } = req.body;
  
    // Vérification des données obligatoires
    if (!nom || !prenom || !tel || !email || !motDePasse) {
      return res.status(400).json({ error: 'Veuillez fournir tous les champs obligatoires' });
    }
  
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
  
      // Chiffrer le mot de passe avec bcrypt
      const hashedPassword = await bcrypt.hash(motDePasse, 10);
  
      // Créer un nouvel utilisateur
      const newUser = new User({
        nom: nom,
        prenom: prenom,
        tel: tel,
        email: email,
        motDePasse: hashedPassword,
        panier: []
      });
  
      // Enregistrer le nouvel utilisateur dans la base de données
      await newUser.save();
  
      res.status(201).json({ message: 'Utilisateur ajouté avec succès' });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ error: 'Error adding user' });
    }
  });
  
  // Route pour récupérer tous les utilisateurs
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  });
  
  // Route pour récupérer un utilisateur par son ID
  app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Error fetching user' });
    }
  });
  
  // Route pour mettre à jour un utilisateur
  app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, tel, email, motDePasse } = req.body;
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
  
      // Mettre à jour les champs modifiables de l'utilisateur
      user.nom = nom || user.nom;
      user.prenom = prenom || user.prenom;
      user.tel = tel || user.tel;
      user.email = email || user.email;
  
      // Vérifier si un nouveau mot de passe est fourni
      if (motDePasse) {
        const hashedPassword = await bcrypt.hash(motDePasse, 10);
        user.motDePasse = hashedPassword;
      }
  
      await user.save();
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Error updating user' });
    }
  });
  
  // Route pour supprimer un utilisateur
  app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByIdAndRemove(id);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Error deleting user' });
    }
  });
//============================================================================

//========================Connexion user=====================================
app.post('/api/login', (req, res) => {
    const { email, motDePasse } = req.body;
  
    // Recherchez l'utilisateur correspondant à l'email fourni dans la base de données
    User.findOne({ email })
      .then((utilisateur) => {
        if (!utilisateur) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
  
        // Vérifiez si le mot de passe saisi correspond au mot de passe stocké dans la base de données
        bcrypt.compare(motDePasse, utilisateur.motDePasse)
          .then((match) => {
            if (!match) {
              return res.status(401).json({ error: 'Mot de passe incorrect' });
            }
  
            // Si le mot de passe est correct,  générer un token d'authentification ou créer une session utilisateur
            res.json({ message: 'Connexion réussie', utilisateur: utilisateur });
          })
          .catch((error) => {
            console.error('Erreur lors de la comparaison des mots de passe:', error);
            res.status(500).json({ error: 'Erreur de connexion' });
          });
      })
      .catch((error) => {
        console.error('Erreur lors de la recherche de l\'utilisateur:', error);
        res.status(500).json({ error: 'Erreur de connexion' });
      });
  });
  
//===========================================================================

// Démarrage du serveur et écoute des requêtes entrantes
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
