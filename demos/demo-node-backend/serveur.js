// src/serveur.js : une première version, remplacée plus bas
import express from 'express';

const app = express();

const produits = [
    { id : 1, nom: "Cafe", prix: 2.30 },
    { id : 2, nom: "Bouteille d'eau", prix: 1.50 },
    { id : 3, nom: "Muffin", prix: 3.11 },
    { id : 4, nom: "Matcha", prix: 4.30 },
    { id : 5, nom: "Dirty chai", prix: 4.30 },
];


app.get("/api/menu", (req, res)=> {
    const { prixmax }  = req.query;

    let result = produits.filter(produit => {
        return produit.prix <= Number(prixmax) 
    })

    res.json(result);
});

app.get("/api/menu/:id", (req, res) => {
    const { id } = req.params;

    const produit = produits.find(prod=>prod.id === Number(id));

    if(!produit) {
        res.status(404).json({"message": "Produit introuvable"})
        return;
    }

    res.json(produit);
})

app.get('/api/bonjour', (req, res) => {
    res.json({ message: 'Bonjour du catalogue' });
});

app.listen(3000, () => {
    console.log('Serveur prêt : http://localhost:3000');
});