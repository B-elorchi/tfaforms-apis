const { supabase } = require("../../config/supabase");

const controllers = {
  getAllPrixIndice: async (req, res) => {
    try {
      const { data: PrixIndice, error: PrixIndiceError } = await supabase
        .from("PrixIndice")
        .select("*");

      if (PrixIndiceError) {
        throw new Error(PrixIndiceError.message);
      }

      return res.status(200).json(PrixIndice);
    } catch (error) {
      console.error("Error in getAllPrixIndice:", error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  addPrixIndice: async (req, res) => {
    try {
      const { id_indice, id_produit, prix_unitaire } = req.body;

      if (!id_indice || !id_produit || !prix_unitaire) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const { data: produitData, error: produitError } = await supabase
        .from("Produits")
        .select("colisage")
        .eq("id", id_produit)
        .single();

      if (produitError) {
        throw new Error(produitError.message);
      }

      const colisage = parseFloat(produitData.colisage) || 1;
      const computedPrixCollisage = parseFloat(prix_unitaire) * colisage;

      const { data, error } = await supabase
        .from("PrixIndice")
        .insert([
          {
            id_indice,
            id_produit,
            prix_unitaire,
            prix_collisage: computedPrixCollisage,
          },
        ])
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return res
        .status(201)
        .json({ message: "PrixIndice added successfully", data });
    } catch (error) {
      console.error("Error in addPrixIndice:", error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  updatePrixIndice: async (req, res) => {
    try {
      const { id_indice, id_produit, prix_unitaire } = req.body;

      if (!id_indice || !id_produit || !prix_unitaire) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const { data: produitData, error: produitError } = await supabase
        .from("Produits")
        .select("colisage")
        .eq("id", id_produit)
        .single();

      if (produitError) {
        throw new Error(produitError.message);
      }

      const colisage = parseFloat(produitData.colisage) || 1;
      const computedPrixCollisage = parseFloat(prix_unitaire) * colisage;

      const { data, error } = await supabase
        .from("PrixIndice")
        .update({
          id_indice,
          id_produit,
          prix_unitaire,
          prix_collisage: computedPrixCollisage,
        })
        .eq("id_produit", id_produit)
        .eq("id_indice", id_indice)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return res
        .status(200)
        .json({ message: "PrixIndice updated successfully", data });
    } catch (error) {
      console.error("Error in updatePrixIndice:", error.message);
      return res.status(400).json({ error: error.message });
    }
  },
  calculateMontantVentes: async (req, res) => {
    try {
      // Step 1: Fetch all vente details
      const { data: venteDetails, error: venteDetailsError } = await supabase
        .from("ventes_detail")
        .select("id_vente, id_produit, quantite");
  
      if (venteDetailsError) throw new Error(venteDetailsError.message);
  
      // Step 2: Fetch id_indice for each vente
      const venteIds = [...new Set(venteDetails.map((vd) => vd.id_vente))];
      console.log("venteIds count:", venteIds.length);
  
      // Use pagination for venteIds if too many
      const chunkArray = (array, size) => 
        Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
          array.slice(i * size, i * size + size)
        );
  
      const venteData = [];
      for (const chunk of chunkArray(venteIds, 100)) { 
        const { data, error } = await supabase
          .from("ventes")
          .select("id, id_indice")
          .in("id", chunk);
  
        if (error) throw new Error(error.message);
        venteData.push(...data);
      }
  
      console.log("Fetched venteData:", venteData.length);
  
      // Create a map of vente id to id_indice
      const venteToIndiceMap = venteData.reduce((map, vente) => {
        if (vente.id && vente.id_indice) {
          map[vente.id] = vente.id_indice;
        }
        return map;
      }, {});
  
      // Step 3: Fetch prix_collisage for each produit and indice
      const produitIndicePairs = venteDetails
        .map((vd) => ({
          id_produit: vd.id_produit,
          id_indice: venteToIndiceMap[vd.id_vente],
        }))
        .filter((pair) => pair.id_indice); // Remove invalid indices
  
      const { data: prixIndices, error: prixIndicesError } = await supabase
        .from("PrixIndice")
        .select("id_produit, id_indice, prix_collisage")
        .in("id_produit", produitIndicePairs.map((pair) => pair.id_produit))
        .in("id_indice", produitIndicePairs.map((pair) => pair.id_indice));
  
      if (prixIndicesError) throw new Error(prixIndicesError.message);
  
      console.log("Fetched prixIndices:", prixIndices.length);
  
      // Create a map of (id_produit, id_indice) to prix_collisage
      const prixCollisageMap = prixIndices.reduce((map, prix) => {
        const key = `${prix.id_produit}-${prix.id_indice}`;
        map[key] = prix.prix_collisage;
        return map;
      }, {});
  
      // Step 4: Calculate the total amount for each product
      const montantVentes = venteDetails.reduce((result, vd) => {
        const id_indice = venteToIndiceMap[vd.id_vente] || "default_value";
        const key = `${vd.id_produit}-${id_indice}`;
        const prixCollisage = prixCollisageMap[key] ?? 0;
        const total = vd.quantite * prixCollisage;
  
        if (!result[vd.id_produit]) result[vd.id_produit] = 0;
        result[vd.id_produit] += total;
  
        return result;
      }, {});
  
      return res.status(200).json(montantVentes);
    } catch (error) {
      console.error("Error in calculateMontantVentes:", error);
      return res.status(400).json({ error: error.message });
    }
  }
  
  ,
};

module.exports = controllers;
