const { supabase } = require("../../config/supabase");

const controllers = {
  createDemande: async (req, res) => {
    const { id_user, id_stock, source_stock, produits, created_at } = req.body;
    if (
      !id_user ||
      !produits ||
      produits.length === 0 ||
      !id_stock ||
      !source_stock
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: id_user,produits,id_stock,source_stock",
        });
    }
    try {
      // Insert the demande
      const demande = await supabase
        .from("demandes")
        .insert({
          id_user,
          id_stock,
          source_stock,
          type: "chargement vehicule",
          created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
        })
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      const newDemande = demande.data[0];
      const demandeDetails = produits.map((product) => ({
        id_demande: newDemande.id,
        id_produit: product.id_produit,
        quantite: product.quantite,
      }));

      // Insert items one by one and handle potential failures
      for (const detail of demandeDetails) {
        const detailsResponse = await supabase
          .from("demande_detail")
          .insert([detail])
          .select();
        console.log("detailsResponse", detailsResponse);
        if (!detailsResponse.data || detailsResponse.error) {
          // Rollback by deleting the stock and its details if an error occurs
          await supabase
            .from("demande_detail")
            .delete()
            .match({ id_demande: newDemande.id });

          await supabase.from("demandes").delete().match({ id: newDemande.id });

          return res
            .status(500)
            .json({
              error:
                "Failed to insert stock detail. Rolled back stock and stock details.",
            });
        }
      }

      // Step 3: Return success response
      return res.status(201).json({
        message: "demande and product quantities added successfully",
        demande: newDemande,
        details: demandeDetails,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  demandeCEntrepot: async (req, res) => {
    const { id_user, id_stock, source_stock, produits, created_at } = req.body;
    if (
      !id_user ||
      !produits ||
      produits.length === 0 ||
      !id_stock ||
      !source_stock
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: id_user, produits,id_stock,source_stock",
        });
    }
    try {
      // Insert the demande
      const demande = await supabase
        .from("demandes")
        .insert({
          id_user,
          id_stock,
          source_stock,
          type: "chargement entrepot",
          created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
        })
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      const newDemande = demande.data[0];
      const demandeDetails = produits.map((product) => ({
        id_demande: newDemande.id,
        id_produit: product.id_produit,
        quantite: product.quantite,
      }));

      // Insert items one by one and handle potential failures
      for (const detail of demandeDetails) {
        const detailsResponse = await supabase
          .from("demande_detail")
          .insert([detail])
          .select();
        console.log("detailsResponse", detailsResponse);
        if (!detailsResponse.data || detailsResponse.error) {
          // Rollback by deleting the stock and its details if an error occurs
          await supabase
            .from("demande_detail")
            .delete()
            .match({ id_demande: newDemande.id });

          await supabase.from("demandes").delete().match({ id: newDemande.id });

          return res
            .status(500)
            .json({
              error:
                "Failed to insert stock detail. Rolled back stock and stock details.",
            });
        }
      }

      // Step 3: Return success response
      return res.status(201).json({
        message: "demande and product quantities added successfully",
        demande: newDemande,
        details: demandeDetails,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  demandeInterne: async (req, res) => {
    const { id_user, id_stock, source_stock, produits, created_at } = req.body;
    if (
      !id_user ||
      !source_stock ||
      !produits ||
      produits.length === 0 ||
      !id_stock
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: id_user,source_stock,id_stock produits",
        });
    }
    try {
      // Insert the demande
      const demande = await supabase
        .from("demandes")
        .insert({
          id_user,
          id_stock,
          source_stock,
          type: "demande interne transfert",
          created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
        })
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      const newDemande = demande.data[0];
      const demandeDetails = produits.map((product) => ({
        id_demande: newDemande.id,
        id_produit: product.id_produit,
        quantite: product.quantite,
      }));

      // Insert items one by one and handle potential failures
      for (const detail of demandeDetails) {
        const detailsResponse = await supabase
          .from("demande_detail")
          .insert([detail])
          .select();
        console.log("detailsResponse", detailsResponse);
        if (!detailsResponse.data || detailsResponse.error) {
          // Rollback by deleting the stock and its details if an error occurs
          await supabase
            .from("demande_detail")
            .delete()
            .match({ id_demande: newDemande.id });

          await supabase.from("demandes").delete().match({ id: newDemande.id });

          return res
            .status(500)
            .json({
              error:
                "Failed to insert stock detail. Rolled back stock and stock details.",
            });
        }
      }

      // Step 3: Return success response
      return res.status(201).json({
        message: "demande and product quantities added successfully",
        demande: newDemande,
        details: demandeDetails,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  getDemandes : async (req, res) => {
    let { page, limit } = req.query;
  
    // Convert to numbers if provided
    page = page ? parseInt(page, 10) : null;
    limit = limit ? parseInt(limit, 10) : null;
  
    // Validate inputs
    if (page !== null && (isNaN(page) || page < 1)) {
      return res.status(400).json({ error: "Page must be a positive number." });
    }
    if (limit !== null && (isNaN(limit) || limit < 1)) {
      return res.status(400).json({ error: "Limit must be a positive number." });
    }
  
    try {
      // Fetch total count of records
      const { count, error: countError } = await supabase
        .from("demandes")
        .select("*", { count: "exact", head: true });
  
      if (countError) {
        return res.status(400).json({ error: countError.message });
      }
  
      // Prepare query
      let query = supabase
        .from("demandes")
        .select(
          "*, responsable:users!demandes_id_user_fkey(id, name), livreur:users!demandes_id_livreur_fkey(id, name), stock(*)"
        );
  
      // Apply pagination only if page & limit are provided
      if (page !== null && limit !== null) {
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end);
      }
  
      // Fetch demandes
      const { data: demandesData, error: demandesError } = await query;
  
      if (demandesError) {
        return res.status(400).json({ error: demandesError.message });
      }
  
      // If no demandes found
      if (demandesData.length === 0) {
        return res.status(404).json({ error: "No demandes found" });
      }
  
      // Fetch demande details
      const { data: detailsData, error: detailsError } = await supabase
        .from("demande_detail")
        .select("*, Produits(*)");
  
      if (detailsError) {
        return res.status(400).json({ error: detailsError.message });
      }
  
      // Associate each demande with its details
      const demandesWithDetails = demandesData.map((demande) => {
        const details = detailsData
          .filter((detail) => detail.id_demande === demande.id)
          .map(({ Produits, quantite, id }) => ({
            id_detail: id,
            produit: Produits?.nomProduit || "Unknown Product",
            quantite,
          }));
  
        return {
          demande,
          details,
        };
      });
  
      return res.status(200).json({
        data: demandesWithDetails,
        total: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: page || 1,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getoneDemande: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }

    try {
      // Récupérer la demande avec les utilisateurs et le stock associés
      const demandes = await supabase
        .from("demandes")
        .select(
          "*, responsable:users!demandes_id_user_fkey(id, name), livreur:users!demandes_id_livreur_fkey(id, name), stock(*)"
        )
        .eq("id", id);

      if (demandes.error) {
        throw new Error(demandes.error.message);
      }

      if (demandes.data.length === 0) {
        return res.status(404).json({ error: "No demande found" });
      }

      // Récupérer les détails de la demande
      const detailsResponse = await supabase
        .from("demande_detail")
        .select("*, Produits(*)")
        .eq("id_demande", id);

      if (detailsResponse.error) {
        return res.status(400).json({ error: detailsResponse.error.message });
      }

      const demande = demandes.data[0];
      const details = detailsResponse.data.map(
        ({ Produits, quantite, id }) => ({
          id_detail: id,
          produit: Produits?.nomProduit || "Unknown Product",
          quantite,
        })
      );

      return res.status(200).json({
        demande,
        details,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  acceptDemande: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing required fields: id" });
    }
    try {
      const demande = await supabase
        .from("demandes")
        .update({ status: "accepted", last_modified: new Date() })
        .eq("id", id)
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      if (demande.data.length === 0) {
        return res.status(404).json({ error: "Demande not found" });
      }
      res
        .status(200)
        .json({
          message: "Demande accepted successfully",
          data: demande.data[0],
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  rejectDemande: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing required fields: id" });
    }
    try {
      const demande = await supabase
        .from("demandes")
        .update({ status: "rejected", last_modified: new Date() })
        .eq("id", id)
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      if (demande.data.length === 0) {
        return res.status(404).json({ error: "Demande not found" });
      }
      res
        .status(200)
        .json({
          message: "Demande rejected successfully",
          data: demande.data[0],
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  affectDriver: async (req, res) => {
    const { id, id_livreur } = req.body;
    if (!id || !id_livreur) {
      return res
        .status(400)
        .json({ error: "Missing required fields: id, id_livreur" });
    }
    try {
      const demande = await supabase
        .from("demandes")
        .update({
          id_livreur,
          status: "awaiting loading",
          last_modified: new Date(),
        })
        .eq("id", id)
        .select("*");
      if (demande.error) {
        throw new Error(demande.error.message);
      }
      if (demande.data.length === 0) {
        return res.status(404).json({ error: "Demande not found" });
      }
      res
        .status(200)
        .json({
          message: "Driver affected successfully",
          data: demande.data[0],
        });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  validerChargement: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing required fields: id" });
    }

    try {
      const getDemande = await supabase
        .from("demandes")
        .select("*")
        .eq("id", id);

      if (getDemande.error) throw new Error(getDemande.error.message);
      if (getDemande.data.length === 0)
        return res.status(404).json({ error: "Demande not found" });

      if (getDemande.data[0].status !== "awaiting loading") {
        return res
          .status(400)
          .json({ error: "Demande is not awaiting loading" });
      }

      const source_stock = getDemande.data[0].source_stock;

      const demande_detail = await supabase
        .from("demande_detail")
        .select("*")
        .eq("id_demande", id);

      if (demande_detail.error) throw new Error(demande_detail.error.message);
      if (demande_detail.data.length === 0)
        return res.status(404).json({ error: "Demande details not found" });

      const details = demande_detail.data;

      // Traitement produit par produit
      for (const detail of details) {
        // Vérifier si le produit est déjà dans le stock
        const { data: stockDetail, error: stockError } = await supabase
          .from("stock_detail")
          .select("*")
          .eq("id_stock", source_stock)
          .eq("id_produit", detail.id_produit);

        if (stockError) throw new Error(stockError.message);

        if (stockDetail.length > 0) {
          // Si le produit existe, diminuer la quantité
          const newQuantite = stockDetail[0].quantite - detail.quantite;

          const { error: updateError } = await supabase
            .from("stock_detail")
            .update({ quantite: newQuantite })
            .eq("id_produit", detail.id_produit)
            .eq("id_stock", source_stock);

          if (updateError) throw new Error(updateError.message);
        } else {
          // Si le produit n'existe pas, créer une nouvelle ligne avec une quantité négative
          const { error: insertError } = await supabase
            .from("stock_detail")
            .insert([
              {
                id_stock: source_stock,
                id_produit: detail.id_produit,
                quantite: -detail.quantite,
              },
            ]);

          if (insertError) throw new Error(insertError.message);
        }
      }

      // Mettre à jour le statut de la demande
      const { error: updateDemandeError } = await supabase
        .from("demandes")
        .update({ status: "loading in progress", validation_chargement: true, last_modified: new Date() }) // statut mis à jour
        .eq("id", id);

      if (updateDemandeError) throw new Error(updateDemandeError.message);

      res.status(200).json({ message: "Chargement validé avec succès" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  validerReception: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing required fields: id" });
    }
    try {
      const getDemande = await supabase
        .from("demandes")
        .select("*")
        .eq("id", id);

      if (getDemande.error) throw new Error(getDemande.error.message);
      if (getDemande.data.length === 0)
        return res.status(404).json({ error: "Demande not found" });

      if (getDemande.data[0].status !== "loading in progress") {
        return res
          .status(400)
          .json({ error: "Demande is not loading in progress" });
      }

      const stock = getDemande.data[0].id_stock;

      const demande_detail = await supabase
        .from("demande_detail")
        .select("*")
        .eq("id_demande", id);

      if (demande_detail.error) throw new Error(demande_detail.error.message);
      if (demande_detail.data.length === 0)
        return res.status(404).json({ error: "Demande details not found" });

      const details = demande_detail.data;

      // Traitement produit par produit
      for (const detail of details) {
        // Vérifier si le produit est déjà dans le stock
        const { data: stockDetail, error: stockError } = await supabase
          .from("stock_detail")
          .select("*")
          .eq("id_stock", stock)
          .eq("id_produit", detail.id_produit);

        if (stockError) throw new Error(stockError.message);

        if (stockDetail.length > 0) {
          // Si le produit existe, diminuer la quantité
          const newQuantite = stockDetail[0].quantite + detail.quantite;

          const { error: updateError } = await supabase
            .from("stock_detail")
            .update({ quantite: newQuantite })
            .eq("id_produit", detail.id_produit)
            .eq("id_stock", stock);

          if (updateError) throw new Error(updateError.message);
        } else {
          // Si le produit n'existe pas, créer une nouvelle ligne avec une quantité positive
          const { error: insertError } = await supabase
            .from("stock_detail")
            .insert([
              {
                id_stock: stock,
                id_produit: detail.id_produit,
                quantite: detail.quantite,
              },
            ]);

          if (insertError) throw new Error(insertError.message);
        }
      }

      // Mettre à jour le statut de la demande
      const { error: updateDemandeError } = await supabase
        .from("demandes")
        .update({ status: "completed", validation_reception: true, last_modified: new Date(), date_validation: new Date() }) // statut mis à jour
        .eq("id", id);
      if (updateDemandeError) throw new Error(updateDemandeError.message);

      res.status(200).json({ message: "Reception validé avec succès" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateDemandeDetail: async (req, res) => {
    const { id } = req.params; // id of demande_detail
    if (!id) {
      return res.status(400).json({ error: "Missing required fields: id" });
    }
    const { quantite } = req.body;
    if (!Number.isInteger(quantite) || quantite < 0) {
      return res
        .status(400)
        .json({ error: "Quantite must be a positive integer" });
    }

    try {
      const updateDetail = await supabase
        .from("demande_detail")
        .update({ quantite })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (!updateDetail) {
        return res
          .status(404)
          .json({ error: "Detail not found or no changes made" });
      }

      res
        .status(200)
        .json({ message: "Detail updated successfully", data: updateDetail });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
module.exports = controllers;
