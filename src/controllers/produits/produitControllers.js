const { supabase } = require("../../config/supabase");

const controllers = {
  addProduit: async (req, res) => {
    const {
      reference,
      nomProduit,
      colisage,
      description,
      idCategory,
      image,
      stock,
      weight_unit,
    } = req.body;

    // Input validation
    if (!reference || !nomProduit || !colisage || !idCategory) {
      return res.status(400).json({
        error: "reference, nomProduit, colisage and idCategory are required!",
      });
    }

    try {
      // Insert new product
      const addProduit = await supabase
        .from("Produits")
        .insert({
          reference,
          nomProduit,
          colisage,
          description,
          idCategory,
          image,
          stock,
          weight_unit,
        })
        .select("*");

      if (addProduit.error) {
        throw new Error(addProduit.error.message);
      }

      const idProduit = addProduit.data[0].id;

      // Fetch all stocks
      const getAllStocks = await supabase.from("stock").select("*");
      if (getAllStocks.error) {
        throw new Error(getAllStocks.error.message);
      }

      const stocks = getAllStocks.data;

      // Insert stock details in batch
      const stockDetails = stocks.map((stock) => ({
        id_produit: idProduit,
        id_stock: stock.id,
        quantite: 0,
      }));

      const insertStock = await supabase
        .from("stock_detail")
        .insert(stockDetails)
        .select("*");
      if (insertStock.error) {
        throw new Error(insertStock.error.message);
      }

      // Return success response
      return res.status(200).json({
        message: "Produit added successfully",
        produit: addProduit.data[0],
      });
    } catch (error) {
      // Catch and return errors
      return res.status(400).json({ error: error.message });
    }
  },

  updateProduit: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    const {
      reference,
      nomProduit,
      colisage,
      description,
      idCategory,
      status,
      stock,
      weight_unit,
      image,
      is_deleted,
    } = req.body;
    const updateProduit = await supabase
      .from("Produits")
      .update({
        nomProduit,
        colisage,
        description,
        reference,
        idCategory,
        Last_modified: new Date(),
        image,
        status,
        stock,
        weight_unit,
        is_deleted,
      })
      .eq("id", id)
      .select("*");
    if (updateProduit.error) {
      return res.status(400).json({ error: updateProduit.error.message });
    }
    return res.status(200).json({
      message: "Produit updated successfully",
      produit: updateProduit.data[0],
    });
  },
  getProduits: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("Produits")
        .select("*,Product_category(*)");

      if (error) throw new Error(error.message || "Unknown error");

      res.status(200).json(data);
    } catch (error) {
      console.error("Error during fetching produits:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getProduit: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    try {
      const response = await supabase
        .from("Produits")
        .select("*,Product_category(*)")
        .eq("id", id);
      if (response.error) {
        return res.status(400).json({ error: response.error.message });
      }
      return res.status(200).json(response.data[0]);
    } catch (error) {
      console.error("Error during fetching produit:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  assignCategoryToProduct: async (req, res) => {
    const { idProduit, idCategory } = req.body;

    // Input validation
    if (!idProduit || !idCategory) {
      return res
        .status(400)
        .json({ error: "idProduit and idCategory are required!" });
    }

    try {
      const updateCategory = await supabase
        .from("Produits")
        .update({ idCategory, Last_modified: new Date() })
        .eq("id", idProduit)
        .select("*");

      if (updateCategory.error) {
        return res.status(400).json({ error: updateCategory.error.message });
      }

      return res.status(200).json({
        message: "Category assigned successfully",
        produit: updateCategory.data[0],
      });
    } catch (error) {
      console.error("Error during assigning category:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  getIdProducts: async (req, res) => {
    const { produits, indice } = req.body;

    if (!produits || !Array.isArray(produits)) {
      return res.status(400).json({ error: "Invalid 'produits' format" });
    }

    try {
      // Use Promise.all to await all database calls
      const productsWithIds = await Promise.all(
        produits.map(async (produit) => {
          const { data, error } = await supabase
            .from("Produits")
            .select("id")
            .eq("nomProduit", produit.nom)
            .single(); // Ensure we get only one result

          if (error || !data) {
            return { error: `Product '${produit.nom}' not found` };
          }

          return { id_produit: data.id, quantite: produit.quantite };
        })
      );

      // Check for errors in individual products
      const errors = productsWithIds.filter((p) => p.error);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      const getIndice = await supabase
        .from("indice")
        .select("id")
        .eq("nom_indice", indice)
        .single(); // Ensure we get only one result
      if (getIndice.error) {
        return res.status(400).json({ error: getIndice.error.message });
      }
      const id_indice = getIndice.data.id;

      // Send successful response
      return res
        .status(200)
        .json({ produits: productsWithIds, id_indice: id_indice });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
};
module.exports = controllers;
