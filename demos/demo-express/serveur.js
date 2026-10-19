import express from 'express';

const app = express();

const produits = [
    { id: 1, nom: "Cafe", prix: 3.75 },
    { id: 2, nom: "Eau", prix: 1.75 },
    { id: 3, nom: "Croissant", prix: 3.25 },
    { id: 4, nom: "Lait au chocolat", prix: 2.50 },
    { id: 5, nom: "Jus d'orange", prix: 2.50 },
]

app.get("/api/produits", (req, res) => {
    const { maxprix } = req.query;

    let resultat = null;
    if (maxprix) {
        resultat = produits.filter(produit => {
            return produit.prix <= Number(maxprix);
        });
    } else {
        resultat = produits;
    }

    res.json(resultat);
})

app.get("/api/produits/:id", (req, res) => {
    const { id } = req.params;

    const resultat = produits.find(produit => {
        return produit.id === Number(id);
    });

    if (!resultat) {
        res.status(404).json({ "message": `Produit avec id ${id} n'existe pas` })
    }

    res.json(resultat);
})

app.get('/api/bonjour', (req, res) => {
    res.json({ message: 'Bonjour du catalogue' });
});

app.listen(3000, () => {
    console.log('Serveur prêt : http://localhost:3000/');
});