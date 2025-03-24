const { json } = require("body-parser");
const { supabase } = require("../../config/supabase");

const transactions = {
  encaissement: async (req, res) => {
    const { id_vendeur, id_client, montant, created_at } = req.body;
    if (!id_vendeur || !id_client || !montant) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const getZone = await supabase
        .from("zone_vendeur")
        .select("id_zone")
        .eq("id_vendeur", id_vendeur);
      if (getZone.error) {
        return res.status(400).json({ error: getZone.error });
      }
      if (getZone.data.length === 0) {
        return res
          .status(404)
          .json({ error: "vendeur n'est pas affecté à une zone" });
      }
      const id_zone = getZone.data[0].id_zone;
      const addEncaissement = await supabase
        .from("transaction_solde")
        .insert({
          id_vendeur,
          id_client,
          montant,
          type: "Encaissement",
          id_zone,
          created_at: created_at || new Date(),
        })
        .select("*");
      if (addEncaissement.error) {
        return res.status(400).json({ error: addEncaissement.error });
      }
      return res.status(201).json({ data: addEncaissement.data[0] });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },
  versement: async (req, res) => {
    const { id_vendeur, id_client, montant, created_at } = req.body;
    const file = req.file;
    if (!id_vendeur || !id_client || !montant || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const getZone = await supabase
        .from("zone_vendeur")
        .select("id_zone")
        .eq("id_vendeur", id_vendeur);
      if (getZone.error) {
        return res.status(400).json({ error: getZone.error });
      }
      if (getZone.data.length === 0) {
        return res
          .status(404)
          .json({ error: "vendeur n'est pas affecté à une zone" });
      }
      const id_zone = getZone.data[0].id_zone;
      const { originalname, buffer, mimetype } = req.file;

      // Check if the client folder exists (optional)
      const { error: listError } = await supabase.storage
        .from("factures")
        .list(id_client);
      if (listError) {
        console.warn("Error listing files:", listError.message);
        return res
          .status(500)
          .json({ error: "Failed to list existing files." });
      }

      // Upload the file to Supabase Storage
      const uploadResult = await supabase.storage
        .from("factures")
        .upload(`${id_client}/${originalname}`, buffer, {
          contentType: mimetype,
          upsert: true,
        });
      console.log("Upload result:", uploadResult);

      if (uploadResult.error) {
        return res.status(500).json({ error: uploadResult.error.message });
      }

      const uploadedPath = uploadResult.data?.path;
      console.log("Uploaded file path:", uploadedPath);

      if (!uploadedPath) {
        return res
          .status(500)
          .json({ error: "Upload failed, no file path returned." });
      }

      // Try getting the public URL
      const publicUrlResponse = supabase.storage
        .from("factures")
        .getPublicUrl(uploadedPath);
      console.log("Public URL Response:", publicUrlResponse);

      const publicUrl = publicUrlResponse.data.publicUrl;
      console.log("Generated Public URL:", publicUrl);
      const addEncaissement = await supabase
        .from("transaction_solde")
        .insert({
          id_vendeur,
          id_client,
          montant,
          type: "Versement",
          id_zone,
          created_at: created_at || new Date(),
          bordereau: publicUrl,
        })
        .select("*");
      if (addEncaissement.error) {
        return res.status(400).json({ error: addEncaissement.error });
      }
      return res.status(201).json({ data: addEncaissement.data[0] });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },

  getAll: async (req, res) => {
    let { page, limit } = req.query;

    page = page ? parseInt(page, 10) : null;
    limit = limit ? parseInt(limit, 10) : null;

    if (page !== null && (isNaN(page) || page < 1)) {
      return res.status(400).json({ error: "Page must be a positive number." });
    }
    if (limit !== null && (isNaN(limit) || limit < 1)) {
      return res
        .status(400)
        .json({ error: "Limit must be a positive number." });
    }

    try {
      const { count, error: countError } = await supabase
        .from("transaction_solde")
        .select("*", { count: "exact", head: true });

      if (countError) {
        return res.status(400).json({ error: countError.message });
      }

      let query = supabase
        .from("transaction_solde")
        .select(
          "*, client:users!transaction_solde_id_client_fkey(id, name), vendeur:users!transaction_solde_id_vendeur_fkey(id, name), ventes(id, id_zone, id_indice)"
        );

      if (page !== null && limit !== null) {
        const start = (page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end);
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return {
        data,
        total: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: page || 1,
      };
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};
module.exports = transactions;
