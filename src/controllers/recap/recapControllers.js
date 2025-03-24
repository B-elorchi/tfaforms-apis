const { supabase } = require("../../config/supabase");

const controllers = {
    sendRecap: async (req, res) => {
        const { data, id_vendeur } = req.body;
    
        if (!data || !id_vendeur) {
            return res.status(400).json({ error: "Missing required fields: data, id_vendeur" });
        }
    
        const Produits = Object.keys(data);
    
        try {
            // Get RPP for the vendor
            const { data: rppData, error: rppError } = await supabase
                .from("users")
                .select("id_rpp")
                .eq("id", id_vendeur)
                .single();
    
            if (rppError || !rppData) {
                return res.status(400).json({ error: "Vendeur has no RPP or an error occurred." });
            }
            const id_rpp = rppData.id_rpp;
    
            // Fetch only the requested products from the database (including product ID)
            const { data: products, error: productsError } = await supabase
                .from("Produits")
                .select("id, nomProduit") // Fetch product ID too
                .in("nomProduit", Produits);
    
            if (productsError) throw new Error(productsError.message);
    
            // Convert products array to a dictionary for quick lookup
            const productMap = products.reduce((acc, product) => {
                acc[product.nomProduit] = product.id;
                return acc;
            }, {});
    
            // Check if all provided products exist in the database
            const existingProducts = products.map(p => p.nomProduit);
            const missingProducts = Produits.filter(p => !existingProducts.includes(p));
            if (missingProducts.length > 0) {
                return res.status(404).json({ error: `Products not found: ${missingProducts.join(", ")}` });
            }
    
            // Calculate total quantity
            let cpt = Produits.reduce((acc, product) => acc + data[product], 0);
            console.log("Total Quantity:", cpt);
    
            // Fetch intervals for the given RPP
            const { data: intervalData, error: intervalError } = await supabase
                .from("RPP")
                .select("id_indice, intervalle(*)")
                .eq("id_name", id_rpp);
    
            if (intervalError) throw new Error(intervalError.message);
            console.log('fetch Interv:', intervalData);
    
            // Find the appropriate interval index
            let indice = null;
            for (const liste of intervalData) {
                if (Array.isArray(liste.intervalle.intervalle)) { // Ensure it's an array
                    const [min, max] = liste.intervalle.intervalle; // Extract min & max correctly
                    if ((cpt >= min && cpt <= max) || (cpt >= min && max === "∞")) {
                        indice = liste.id_indice;
                        break;
                    }
                } else {
                    console.error("intervalle.intervalle is not an array:", liste.intervalle.intervalle);
                }
            }
    
            if (!indice) {
                return res.status(400).json({ error: "No matching interval found for the given quantity." });
            }
            console.log("Matching Index:", indice);
    
            // Fetch pricing based on the found index
            const { data: prixData, error: prixError } = await supabase
                .from("PrixIndice")
                .select("prix_collisage, Produits(id, nomProduit, colisage, reference)") // Fetch both product ID & name
                .eq("id_indice", indice);
    
            if (prixError) throw new Error(prixError.message);
    
            // Filter and map only the requested products with their IDs
            const result = prixData
                .filter(prix => data.hasOwnProperty(prix.Produits.nomProduit))
                .map(prix => ({
                    produit_id: prix.Produits.id, // Include product ID
                    produit: prix.Produits.nomProduit,
                    quantite: data[prix.Produits.nomProduit],
                    colisage: prix.Produits.colisage,
                    reference: prix.Produits.reference,
                    prix_collisage: prix.prix_collisage,
                    Total: prix.prix_collisage * data[prix.Produits.nomProduit],
                }));
    
            // Calculate total amount
            const totalCommande = result.reduce((acc, item) => acc + item.Total, 0);
    
            return res.status(200).json({
                Produits_commandés: {
                    result,
                    nombre_total_produits: result.length,
                    total_Qunatite_Prod: cpt,
                    totalCommande,
                    indice
                },
            });
    
        } catch (error) {
            console.error("Error:", error.message);
            return res.status(400).json({ error: error.message });
        }
    },    
};

module.exports = controllers;
