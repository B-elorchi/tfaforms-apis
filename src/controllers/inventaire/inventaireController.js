const { supabase } = require("../../config/supabase");

const controllers = {
  assignResponsable: async (req, res) => {
    const { id_responsable, stocks, id_indice, start_date, end_date } = req.body;

    try {
        const stockIds = Array.isArray(stocks) ? stocks : [stocks];

        const newInventories = await Promise.all(
            stockIds.map(async (id_stock) => {
                const { data: newInventory, error: insertError } = await supabase
                    .from("inventaire")
                    .insert([
                        {
                            id_responsable: id_responsable || null,
                            id_stock: id_stock || null,
                            id_indice: id_indice || null,
                            start_date: start_date || null,
                            end_date: end_date || null,
                        },
                    ])
                    .select(); 

                if (insertError) throw new Error(insertError.message);

                return newInventory;
            })
        );

        console.log("New inventories created:", newInventories);

        res.status(201).json({
            message: "Inventories created successfully",
            inventories: newInventories,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
},

  createInventaireDetails: async (req, res) => {
    const { id_produit, quantite_produit, quantite_inventaire, id_indice, id_stock, id_responsable, start_date, end_date } = req.body;

    try {
        if (!id_produit || !id_indice || !id_stock || !id_responsable || !start_date || !end_date) {
            throw new Error("Missing required fields: id_produit, id_indice, id_stock, id_responsable, start_date, or end_date");
        }

        let { data: existingInventaire, error: fetchInventaireError } = await supabase
            .from("inventaire")
            .select("id")
            .eq("id_indice", id_indice)
            .eq("id_stock", id_stock)
            .maybeSingle();

        if (fetchInventaireError) {
            throw new Error(fetchInventaireError.message);
        }

        let id_inventaire;

        if (!existingInventaire) {
            const { data: newInventaire, error: insertInventaireError } = await supabase
                .from("inventaire")
                .insert([{ id_indice, id_stock, id_responsable, start_date, end_date }])
                .select("id")
                .maybeSingle();

            if (insertInventaireError) throw new Error(insertInventaireError.message);
            if (!newInventaire) throw new Error("Failed to create new inventaire");

            id_inventaire = newInventaire.id;
        } else {
            id_inventaire = existingInventaire.id;
        }

        const { data: prixIndice, error: prixIndiceError } = await supabase
            .from("PrixIndice")
            .select("prix_collisage")
            .eq("id_produit", id_produit)
            .eq("id_indice", id_indice)
            .maybeSingle();

        if (prixIndiceError) throw new Error(prixIndiceError.message);
        if (!prixIndice) {
            throw new Error("PrixIndice not found for the given product and indice");
        }

        const { prix_collisage } = prixIndice;

        let quantite_manquant, prix_paye;

        if (quantite_inventaire === 0) {
            quantite_manquant = 0;
            prix_paye = 0;
        } else {
            quantite_manquant = quantite_produit - quantite_inventaire;
            prix_paye = quantite_manquant * prix_collisage;
        }

        const { data, error: upsertError } = await supabase
            .from("inventaire_details")
            .upsert(
                {
                    id_inventaire,
                    id_produit,
                    quantite_produit,
                    quantite_inventaire,
                    quantite_manquant,
                    prix_paye,
                    id_indice,
                    id_stock,
                    start_date,
                    end_date,
                },
                { onConflict: ["id_inventaire", "id_produit"] }
            );

        if (upsertError) throw new Error(upsertError.message);

        res.status(200).json({
            message: "Inventaire details created successfully",
            inventaire_details: { id_inventaire, prix_paye, start_date, end_date },
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({ error: error.message });
    }
},
   
  getAllInventaireDetails: async (req, res) => {
    try {
      const { data: inventaireDetails, error } = await supabase
        .from("inventaire_details")
        .select("*");

      if (error) throw new Error(error.message);

      if (!inventaireDetails || inventaireDetails.length === 0) {
        return res.status(404).json({ error: "No inventaire details found" });
      }

      res.status(200).json({ inventaire_details: inventaireDetails });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
  getAllInventaire: async (req, res) => {
    try {
      const { data: inventaireDetails, error } = await supabase
        .from("inventaire")
        .select("*");

      if (error) throw new Error(error.message);

      if (!inventaireDetails || inventaireDetails.length === 0) {
        return res.status(404).json({ error: "No inventaire details found" });
      }

      res.status(200).json({ inventaire_details: inventaireDetails });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = controllers;
