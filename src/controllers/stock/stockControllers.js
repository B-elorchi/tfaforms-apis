const { supabase } = require("../../config/supabase");

const controllers = {
  addStock: async (req, res) => {
    const { name, type, capacite, zone_id, responsable_id, products } =
      req.body;

    // Validation: Check required fields
    if (
      !name ||
      !type ||
      !capacite ||
      !zone_id ||
      !products ||
      !Array.isArray(products)
    ) {
      return res
        .status(400)
        .json({
          error: "All fields are required, and products must be an array.",
        });
    }

    try {
      // Step 1: Insert stock into the `stock` table
      let stocksToInsert = [
        {
          nom: name,
          type,
          capacite,
          id_zone: zone_id,
          responsable: responsable_id,
        },
      ];
      const stockResponse = await supabase
        .from("stock")
        .insert(stocksToInsert)
        .select();

      if (stockResponse.error) {
        return res.status(400).json({ error: stockResponse.error.message });
      }

      const newStocks = stockResponse.data; // Array of inserted stocks

      // Step 2: Insert product quantities into `stock-detail`
      const stockDetails = newStocks.flatMap((stock) =>
        products.map((product) => ({
          id_stock: stock.id,
          id_produit: product.id_produit,
          quantite: product.quantite,
        }))
      );

      const detailsResponse = await supabase
        .from("stock_detail")
        .insert(stockDetails)
        .select();

      if (detailsResponse.error) {
        // Rollback all inserted stocks if `stock_detail` insertion fails
        const stockIds = newStocks.map((stock) => stock.id);
        await supabase.from("stock").delete().in("id", stockIds);

        return res
          .status(500)
          .json({
            error: "Failed to insert stock detail. Rolled back stock records.",
          });
      }

      // Step 3: Return success response
      return res.status(201).json({
        message: "Stock and product quantities added successfully",
        stocks: newStocks,
        details: detailsResponse.data,
      });
    } catch (error) {
      console.error("Error during stock creation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  assignResponsable: async (req, res) => {
    const { responsable, id } = req.body;
    if (!id || !responsable) {
      return res.status(400).json({ error: "id, responsable are required" });
    }
    try {
      const response = await supabase
        .from("stock")
        .update({ responsable, last_modified: new Date() })
        .eq("id", id)
        .select("*");

      if (response.error) {
        return res.status(400).json({ error: error.message });
      }
      res
        .status(200)
        .json({
          message: "Responsibility assigned successfully.",
          data: response.data[0],
        });
    } catch (error) {
      console.error("Error during assign responsable:", error);
      return res.status(500).json({ error: error });
    }
  },
  updateStock: async (req, res) => {
    const {id} = req.params;
    const {
      name,
      type,
      capacite,
      id_zone,
      status,
      responsable_id,
    } = req.body;

    // Validation: Check required fields
    if (!id) {
        return res.status(400).json({ error: "id is required!" });
    }

    try {
      // Step 1: Update the `stock` table
      const stockResponse = await supabase
        .from("stock")
        .update({
          nom: name,
          type,
          capacite,
          status,
          id_zone,
          responsable: responsable_id,
        })
        .eq("id", id)
        .select(); // Retrieve the updated stock

      if (stockResponse.error) {
        return res.status(400).json({ error: stockResponse.error });
      }

      const updatedStock = stockResponse.data[0];


      // Step 3: Return success response
      return res.status(200).json({
        message: "Stock updated successfully",
        stock: updatedStock,
      });
    } catch (error) {
      console.error("Error during stock update:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getOneStock: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    try {
      // Fetch stock data
      const stockResponse = await supabase
        .from("stock")
        .select("*, zones(*), users(*)")
        .eq("id", id);

      if (stockResponse.error) {
        return res.status(400).json({ error: stockResponse.error.message });
      }

      const stock = stockResponse.data[0];
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Fetch stock details
      const detailsResponse = await supabase
        .from("stock_detail")
        .select("*, Produits(*), stock(*)")
        .eq("id_stock", id);

      if (detailsResponse.error) {
        return res.status(400).json({ error: detailsResponse.error.message });
      }

      // Map stock details
      const details = detailsResponse.data.map(({ Produits, quantite, status, isDeleted }) => ({
        id: Produits.id,
        produit: Produits.nomProduit,
        quantite,
        status,
        isDeleted
      }));

      // Construct response
      return res.status(200).json({
        message: "Details retrieved successfully",
        id: stock.id,
        name: stock.nom,
        type: stock.type,
        created_at: stock.created_at,
        updated_at: stock.last_modified,
        responsable_id: stock.users?.id,
        responsable: stock.users?.name || "No responsible assigned",
        capacite: stock.capacite,
        id_zone: stock.zones?.id,
        status: stock.status,
        isDeleted: stock.isDeleted,
        zone: stock.zones?.Nom || "No zone assigned",
        details,
      });
    } catch (error) {
      console.error("Error during get one stock:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllStocks: async (req, res) => {
    try {
      // Fetch all stocks with related data (zones, users)
      const stocksResponse = await supabase
        .from("stock")
        .select("*, zones(*), users(*)");

      if (stocksResponse.error) {
        return res.status(400).json({ error: stocksResponse.error.message });
      }

      const stocks = stocksResponse.data;

      // Ensure there are stocks to return
      if (stocks.length === 0) {
        return res.status(404).json({ error: "No stocks found" });
      }

      // Fetch details for all stocks
      const stockDetailsResponse = await supabase
        .from("stock_detail")
        .select("*, Produits(*), stock(*)");

      if (stockDetailsResponse.error) {
        return res
          .status(400)
          .json({ error: stockDetailsResponse.error.message });
      }

      const stockDetails = stockDetailsResponse.data;

      // Map over stocks to include details for each one
      const stocksWithDetails = stocks.map((stock) => {
        const details = stockDetails
          .filter((detail) => detail.id_stock === stock.id)
          .map(({ Produits, quantite, status, isDeleted }) => ({
            id: Produits.id,
            produit: Produits.nomProduit,
            quantite,
            status,
            isDeleted
          }));

        return {
          id: stock.id,
          message: "Details retrieved successfully",
          name: stock.nom,
          type: stock.type,
          created_at: stock.created_at,
          updated_at: stock.last_modified,
          responsable_id: stock.users?.id,
          responsable: stock.users?.name || "No responsible assigned",
          capacite: stock.capacite,
          status: stock.status,
          isDeleted: stock.isDeleted,
          zone: stock.zones?.Nom || "No zone assigned",
          id_zone: stock.zones?.id,
          details,
        };
      });

      // Respond with all stocks
      return res.status(200).json(stocksWithDetails);
    } catch (error) {
      console.error("Error during get all stocks:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
//   updateStatus: async (req, res) => {
//     const { id } = req.params;
//     if (!id) {
//         return res.status(400).json({ error: 'ID is required!' });
//     }

//     const { status } = req.body;
//     if (status === undefined) {  // Ensure status is provided
//         return res.status(400).json({ error: 'Status is required!' });
//     }

//     try {
//         const { data, error } = await supabase
//             .from('stock')
//             .update({ status })
//             .eq('id', id)
//             .select();  // Returns the updated row

//         if (error) {
//             return res.status(400).json({ error: error.message });
//         }

//         if (!data || data.length === 0) {  // Check if the update actually happened
//             return res.status(404).json({ error: 'Stock not found!' });
//         }

//         return res.status(200).json({ message: 'Status updated successfully', data });
//     } catch (error) {
//         return res.status(500).json({
//             error: 'Internal server error',
//             detail: error.message
//         });
//     }
// }
deleteStock: async (req, res) => {
  const { id } = req.params;
  if (!id) {
      return res.status(400).json({ error: "ID is required!" });
  }

  try {
      // Check if the stock exists before updating
      const { data, error: findError } = await supabase
          .from('stock')
          .select('*')
          .eq('id', id)
          .single();

      if (findError || !data) {
          return res.status(404).json({ error: "Stock not found!" });
      }

      // Perform the soft deletion by updating `isDeleted` field
      const { error: updateError } = await supabase
          .from('stock')
          .update({ isDeleted: true })
          .eq('id', id);

      if (updateError) {
          return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({ message: "The stock was deleted successfully!" });
  } catch (error) {
      return res.status(500).json({
          error: "Internal server error",
          detail: error.message,
      });
  }
}
};
module.exports = controllers;
