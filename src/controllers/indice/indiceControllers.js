const { supabase } = require("../../config/supabase");

const controllers = {
  createIndice: async (req, res) => {
    const { nom_indice, type_indice, status, id_liste } = req.body;
    try {
      const indice = await supabase
        .from("indice")
        .insert({
          nom_indice,
          type_indice,
          status,
          id_liste,
        })
        .select("*");
      if (indice.error) {
        throw new Error(indice.error.message);
      }
      res
        .status(201)
        .json({ message: "indice created successfully", data: indice.data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  getOne: async (req, res) => {
    const { id } = req.params;
    try {
      const indices = await supabase.from("indice").select("*").eq("id", id);
      if (indices.error) {
        throw new Error(indices.error.message);
      }
      if (indices.data.length === 0) {
        throw new Error("Indice not found");
      }
      const id_indice = indices.data[0].id;
      const getPrix = await supabase
        .from("PrixIndice")
        .select("*, Produits(*)")
        .eq("id_indice", id_indice);
      if (getPrix.error) {
        throw new Error(getPrix.error.message);
      }
      const details = getPrix.data.map((prix) => ({
        id_indice: id_indice,
        id_produit: prix.id_produit,
        produit: prix.Produits.nomProduit,
        price: prix.prix_collisage,
      }));
      res.status(200).json({ indice: indices.data[0], details });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  createPrix: async (req, res) => {
    const { id_indice, id_produit, prix_unitaire } = req.body;

    // Input validation
    if (!id_indice || !id_produit || !prix_unitaire) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: id_indice, id_produit, prix_unitaire",
        });
    }

    try {
      // Fetch product colisage
      const { data: produit, error: produitError } = await supabase
        .from("Produits")
        .select("colisage")
        .eq("id", id_produit)
        .single(); // Use .single() to ensure only one record is returned

      if (produitError) {
        throw new Error(produitError.message);
      }
      if (!produit) {
        throw new Error("Product not found");
      }

      const { colisage } = produit;
      if (typeof colisage !== "number" || isNaN(colisage)) {
        throw new Error("Invalid colisage value in product data");
      }

      // Insert new price
      const { data: prix, error: prixError } = await supabase
        .from("PrixIndice")
        .insert({
          id_indice,
          id_produit,
          prix_unitaire,
          prix_collisage: prix_unitaire * colisage,
        })
        .select("*")
        .single(); // Use .single() to ensure only one record is returned

      if (prixError) {
        throw new Error(prixError.message);
      }

      res.status(201).json(prix);
    } catch (error) {
      console.error("Error in createPrix:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
  createIndiceWithPrix: async (req, res) => {
    const { nom_indice, id_liste, Prix } = req.body;

    // Validate request body
    if (!nom_indice || !Prix || typeof Prix !== 'object' || Object.keys(Prix).length === 0) {
        return res.status(400).json({ error: "Missing required fields: nom_indice, Prix" });
    }

    try {
      // Check if an indice with the same name already exists
      const getIndice = await supabase
        .from("indice")
        .select("*")
        .eq("nom_indice", nom_indice);
      console.log(getIndice);
      if (getIndice.error) {
        throw new Error(getIndice.error.message);
      }

      if (getIndice.data && getIndice.data.length > 0) {
        return res
          .status(409)
          .json({ error: "An indice with this name already exists." });
      }

        // Step 1: Create the new indice entry
        const { data: indiceData, error: indiceError } = await supabase
            .from("indice")
            .insert({ nom_indice })
            .select("*")
            .single(); // Ensure we get a single inserted record

      if (indiceError) {
        throw new Error(indiceError.message);
      }

      const id_indice = indiceData.id;

      // Step 2: Fetch product colisage for all products
      const productIds = Object.keys(Prix);
      const { data: products, error: productsError } = await supabase
        .from("Produits")
        .select("id, colisage")
        .in("id", productIds); // Fetch all required products in one query

      if (productsError) {
        throw new Error(productsError.message);
      }

      // Ensure all products exist
      const missingProducts = productIds.filter(
        (pid) => !products.some((p) => p.id == pid)
      );
      if (missingProducts.length > 0) {
        return res
          .status(404)
          .json({ error: `Products not found: ${missingProducts.join(", ")}` });
      }

      // Step 3: Prepare and insert pricing records
      const prixInsertions = products.map((product) => {
        const prix_unitaire = Prix[product.id]; // Get unit price from request
        const prix_collisage = prix_unitaire * product.colisage;

        return {
          id_indice,
          id_produit: product.id,
          prix_unitaire,
          prix_collisage,
        };
      });

      const { data: prixData, error: prixError } = await supabase
        .from("PrixIndice")
        .insert(prixInsertions)
        .select("*");

      if (prixError) {
        throw new Error(prixError.message);
      }

      res.status(201).json({
        message: "Indice and prices created successfully",
        indice: indiceData,
        prix: prixData,
      });
    } catch (error) {
      console.error("Error in createIndiceWithPrix:", error.message);
      res.status(400).json({ error: error.message });
    }
  },
  getAllIndice: async (req, res) => {
    try {
      // Step 1: Fetch all indices at once
      const { data: indices, error: indicesError } = await supabase
        .from("indice")
        .select("*");

      if (indicesError) {
        throw new Error(indicesError.message);
      }

      if (!indices || indices.length === 0) {
        return res.status(200).json([]); // Return empty array instead of throwing an error
      }

      // Step 2: Fetch all PrixIndice data in a single query
      const { data: allPrices, error: pricesError } = await supabase
        .from("PrixIndice")
        .select("*, Produits(nomProduit)"); // Fetch all at once with related product data

      if (pricesError) {
        throw new Error(pricesError.message);
      }

      // Step 3: Group prices by indice ID
      const groupedPrices = allPrices.reduce((acc, price) => {
        const { id_indice, Produits, prix_unitaire, id_produit } = price;
        if (!acc[id_indice]) acc[id_indice] = [];
        acc[id_indice].push({
          id_indice: id_indice,
          id_produit: id_produit,
          produit: Produits?.nomProduit || "Unknown Product",
          price: prix_unitaire,
        });
        return acc;
      }, {});

      // Step 4: Construct response with indices and their associated prices
      const result = indices.map((indice) => ({
        indice,
        details: groupedPrices[indice.id] || [], // Attach prices or empty array if none exist
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAllIndice:", error.message);
      return res.status(400).json({ error: error.message });
    }
  },
  updateIndice: async (req, res) => {
    const { id } = req.params;
    const { nom_indice, type_indice, status, id_liste } = req.body;

    try {
      // Update the indice in the database
      const { data, error } = await supabase
        .from("indice")
        .update({
          nom_indice,
          type_indice,
          status,
          id_liste,
        })
        .eq("id", id) // Match the indice by its ID
        .select("*"); // Return the updated record

      if (error) {
        throw new Error(error.message);
      }

      // If no rows are updated, the indice with the given ID does not exist
      if (data.length === 0) {
        return res.status(404).json({ error: "Indice not found" });
      }

      // Return the updated indice
      res
        .status(200)
        .json({ message: "Indice updated successfully", data: data[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateIndiceDetails: async (req, res) => {
    const { id } = req.params;
    const { details } = req.body;

    try {
      const { data: indice, error: indiceError } = await supabase
        .from("indice")
        .select("*")
        .eq("id", id) 
        .single(); 

      if (indiceError) {
        throw new Error(indiceError.message);
      }

      if (!indice) {
        return res.status(404).json({ error: "Indice not found" });
      }

      if (!details || !Array.isArray(details)) {
        return res
          .status(400)
          .json({ error: "Invalid request format for details" });
      }

      const updatedDetails = details.map((detail) => ({
        id_indice: id, 
        produit: detail.produit,
        price: detail.price,
      }));

      const { data: updatedPrices, error: pricesError } = await supabase
        .from("PrixIndice")
        .upsert(updatedDetails, { onConflict: ["id_indice", "produit"] }) // Update or insert based on conflict
        .select("*");

      if (pricesError) {
        throw new Error(pricesError.message);
      }

      // Step 5: Fetch the updated prices to return them along with the indice
      const { data: allPrices, error: fetchPricesError } = await supabase
        .from("PrixIndice")
        .select("*, Produits(nomProduit)") // Fetch related product data
        .eq("id_indice", id);

      if (fetchPricesError) {
        throw new Error(fetchPricesError.message);
      }

      // Step 6: Group the prices by indice ID (just like in getAllIndice)
      const groupedPrices = allPrices.reduce((acc, price) => {
        const { id_indice, Produits, prix_unitaire } = price;
        if (!acc[id_indice]) acc[id_indice] = [];
        acc[id_indice].push({
          produit: Produits?.nomProduit || "Unknown Product",
          price: prix_unitaire,
        });
        return acc;
      }, {});

      // Step 7: Construct the response with the updated indice and details
      const result = {
        indice,
        details: groupedPrices[indice.id] || [], // Attach updated prices or an empty array if none exist
      };

      return res.status(200).json({
        message: "Indice details updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateIndiceDetails:", error.message);
      return res.status(400).json({ error: error.message });
    }
  },
};

module.exports = controllers;
