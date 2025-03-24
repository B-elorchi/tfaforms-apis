const { supabase } = require("../../config/supabase");

detail={
    updateDetail: async (req, res) => {
        const { id } = req.params;
        const { products } = req.body;
    
        if (!id || !products || products.length === 0) {
            return res.status(400).json({ error: "Missing required fields!" });
        }
    
        try {
            // Fetch all detail IDs and id_vendeur from the vente
            const fetchDetail = await supabase
                .from("ventes_detail")
                .select("id, ventes(id_vendeur)")
                .eq("id_vente", id);
    
            if (fetchDetail.error) {
                return res.status(400).json({ error: fetchDetail.error.message });
            }
    
            const ids = fetchDetail.data.map((detail) => detail.id);
            const id_vendeur = fetchDetail.data[0].ventes.id_vendeur;
            const getStockVendeur = await supabase
            .from('stock')
            .select('id')
            .eq('responsable', id_vendeur)
            .eq('type', 'vehicule');
            if(getStockVendeur.error){
                return res.status(400).json({error: getStockVendeur.error})
            }
            if(!getStockVendeur.data){
                return res.status(400).json('vendeur does not have a stock')
            }
            const id_stock = getStockVendeur.data[0].id; 
            const getStockDetail = await supabase
            .from('stock_detail')
            .select('*')
            .id('id',id_stock)
            if(getStockDetail.error){
                return res.status(400).json({error: getStockDetail.error})
            }
            if(getStockDetail.data.length === 0){
               const addProducts = await suapabase
                .from
            }
            if (ids.length > 0) {
                const { error: deleteError } = await supabase
                    .from("stock_detail")
                    .update()
                    .in("id", id_stock);
    
                if (deleteError) {
                    return res.status(400).json({ error: deleteError.message });
                }
            }
            products.map(p=>{

            })
            const returnProduct = await supabase

            // Delete existing details
            if (ids.length > 0) {
                const { error: deleteError } = await supabase
                    .from("ventes_detail")
                    .delete()
                    .in("id", ids);
    
                if (deleteError) {
                    return res.status(400).json({ error: deleteError.message });
                }
            }
    
            // Insert new details
            const newDetails = products.map((product) => ({
                id_produit: product.id_produit,
                quantite: product.quantite,
                id_vente: id,
            }));
    
            const { error: insertError } = await supabase
                .from("ventes_detail")
                .insert(newDetails);
    
            if (insertError) {
                return res.status(400).json({ error: insertError.message });
            }
    
            // Calculate total quantity
            let cpt = products.reduce((acc, product) => acc + product.quantite, 0);
    
            // Fetch intervals for the vendor
            const getListes = await supabase
                .from("RPP")
                .select("*, intervalle(*)")
                .eq("id_vendeur", id_vendeur);
    
            if (getListes.error) {
                return res.status(400).json({ error: getListes.error.message });
            }
    
            // Find the interval index
            let indice = null;
            for (const liste of getListes.data) {
                if (
                    (cpt >= liste.intervalle.intervalle[0] && cpt <= liste.intervalle.intervalle[1]) ||
                    (cpt >= liste.intervalle.intervalle[0] && liste.intervalle.intervalle[1] === "∞")
                ) {
                    indice = liste.id_indice;
                }
            }
    
            if (!indice) {
                return res.status(400).json({ error: "No matching interval found for the given quantity." });
            }
    
            // Fetch pricing based on the found index
            const getPrix = await supabase
                .from("PrixIndice")
                .select("prix_collisage, id_produit")
                .eq("id_indice", indice);
    
            if (getPrix.error) {
                return res.status(400).json({ error: getPrix.error.message });
            }
    
            // Map product quantities by product ID
            const productQuantities = products.reduce((acc, product) => {
                acc[product.id_produit] = product.quantite;
                return acc;
            }, {});
    
            // Compute total price
            const result = getPrix.data
                .filter(prix => productQuantities.hasOwnProperty(prix.id_produit))
                .map(prix => ({
                    produitId: prix.id_produit,
                    Quantité: productQuantities[prix.id_produit],
                    prix_collisage: prix.prix_collisage,
                    Total: prix.prix_collisage * productQuantities[prix.id_produit],
                }));
    
            const prixTotalCommande = result.reduce((acc, item) => acc + item.Total, 0);
    
            // Update totalcommande in ventes table
            const { error: updateError } = await supabase
                .from("ventes")
                .update({ total_commande: prixTotalCommande })
                .eq("id", id);
    
            if (updateError) {
                return res.status(400).json({ error: updateError.message });
            }
    
            return res.status(200).json({
                message: "Details updated and recap calculated successfully!",
                Produits_commandés: {
                    result,
                    nombre_total_produits: result.length,
                    total_Qunatite_Prod: cpt,
                    prix_total_commande: prixTotalCommande,
                },
            });
    
        } catch (e) {
            return res.status(500).json({ error: "Internal Server Error", detail: e.message });
        }
    }
    
}
module.exports = detail;