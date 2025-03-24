const { supabase } = require("../../config/supabase");

const receptions={
getReceptions: async (req, res) => {
        try {
          const { data, error } = await supabase
            .from('reception')
            .select('*, users(*)');
    
          if (error) {
            return res.status(400).json({ error: error.message });
          }
    
          if (!data.length) {
            return res.status(404).json({ error: "No reception found!" });
          }
    
          return res.status(200).json(data);
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      },
      
// updateReception: async (req, res) => {
//         const { id } = req.params;
//         const { status, updatedBy } = req.body;
    
//         if (!id) {
//           return res.status(400).json({ error: "ID is required!" });
//         }
    
//         if (!status || !updatedBy) {
//           return res.status(400).json({ error: "Both 'status' and 'updatedBy' are required!" });
//         }
    
//         try {
//           const { data, error } = await supabase
//             .from('reception')
//             .update({ status, updatedBy })
//             .eq('id', id)
//             .select('*');
    
//           if (error) {
//             return res.status(400).json({ error: error.message });
//           }
    
//           if (!data.length) {
//             return res.status(404).json({ error: "Reception not found!" });
//           }
    
//         //   return res.status(200).json({ message: "Reception updated successfully.", data: data[0] });
//         if (status === "accepted") {
//           const getDemandeDetails = async (req, res) => {
//               try {
//                   const { id } = req.params; // Extract id from request parameters
      
//                   if (!id) {
//                       return res.status(400).json({ error: "Missing demande ID" });
//                   }
      
//                   // Fetch demande with users and stock details
//                   const { data: demandes, error: demandesError } = await supabase
//                       .from("demandes")
//                       .select("*, users(*), stock(*)")
//                       .eq("id", id);
      
//                   if (demandesError) {
//                       throw new Error(demandesError.message);
//                   }
      
//                   if (!demandes || demandes.length === 0) {
//                       return res.status(404).json({ error: "No demande found" });
//                   }
      
//                   // Fetch demande details
//                   const { data: detailsData, error: detailsError } = await supabase
//                       .from("demande_detail")
//                       .select("*, Produits(*)")
//                       .eq("id_demande", id);
      
//                   if (detailsError) {
//                       return res.status(400).json({ error: detailsError.message });
//                   }
      
//                   const demande = demandes[0];
      
//                   const details = detailsData.map(({ Produits, quantite }) => ({
//                       produit: Produits?.id || "Unknown Product",
//                       quantite,
//                   }));
      
//                   return res.status(200).json({
//                       id: demande.id,
//                       status: demande.status,
//                       type: demande.type,
//                       created_at: demande.created_at,
//                       updated_at: demande.last_modified || demande.updated_at,
//                       user: demande.users?.id || "Unknown User",
//                       stock: demande.stock?.id || "Unknown Stock",
//                       details,
//                   });
//                 } catch (error) {
//                   return res.status(500).json({ error: error.message });
//               }}
//             }
          
//         } catch (error) {
//           return res.status(500).json({ error: error.message });
//         }
//       }
updateReception: async (req, res) => {
    const { id } = req.params;
    const { status, updatedBy } = req.body;
  
    if (!id) {
      return res.status(400).json({ error: "ID is required!" });
    }
  
    if (!status || !updatedBy) {
      return res.status(400).json({ error: "Both 'status' and 'updatedBy' are required!" });
    }
  
    try {
      // Update reception status
      const { data: receptionData, error: receptionError } = await supabase
        .from("reception")
        .update({ status, updatedBy })
        .eq("id", id)
        .select("*");
  
      if (receptionError) {
        return res.status(400).json({ error: receptionError.message });
      }
  
      if (!receptionData.length) {
        return res.status(404).json({ error: "Reception not found!" });
      }
  
      // If status is not "accepted", return the updated reception
      if (status !== "accepted") {
        return res.status(200).json({
          message: "Reception updated successfully.",
          reception: receptionData[0],
        });
      }
  
      // Fetch demande details
      const demandeResponse = await supabase
        .from("reception")
        .select("*, demandes(*)") // Fetch related demandes
        .eq("id", id);
  
      if (demandeResponse.error) {
        return res.status(400).json({ error: demandeResponse.error.message });
      }
  
      if (!demandeResponse.data || demandeResponse.data.length === 0) {
        return res.status(404).json({ error: "No demande found for this reception!" });
      }
  
      // Extract demande details
      const reception = demandeResponse.data[0];
      const demande = reception.demandes;
  
      if (!demande) {
        return res.status(404).json({ error: "No demande found!" });
      }
  
      const id_demande = demande.id;
      const stock = demande.id_stock;
      const source = demande.source_stock;
      // Fetch all products and quantities from demande_detail
      const { data: demandeDetails, error: detailsError } = await supabase
        .from("demande_detail")
        .select("id_produit, quantite")
        .eq("id_demande", id_demande);
  
      if (detailsError) {
        return res.status(400).json({ error: detailsError.message });
      }
  
      if (!demandeDetails.length) {
        return res.status(404).json({ error: "No demande details found!" });
      }
  
      // Process stock updates
      for (const { id_produit, quantite } of demandeDetails) {
        // Fetch stock details for this product
        const { data: stockData, error: stockError } = await supabase
          .from("stock_detail")
          .select("id, quantite")
          .eq("id_stock", stock)
          .eq("id_produit", id_produit);
  
        if (stockError) {
          return res.status(400).json({ error: stockError.message });
        }
  
        if (!stockData.length) {
          return res.status(400).json({ error: `No stock found for product ${id_produit}` });
        }
  
        // Compute new stock quantity
        const currentQuantity = stockData[0].quantite;
        const newQuantity = currentQuantity + quantite;
  
        // Update stock quantity
        const { error: updateStockError } = await supabase
          .from("stock_detail")
          .update({ quantite: newQuantity, last_modified: new Date() })
          .eq("id_stock", stock)
          .eq("id_produit", id_produit);
  
        if (updateStockError) {
          return res.status(400).json({ error: `Failed to update stock for product ${id_produit}` });
        }
      }
      for(const {id_produit, quantite} of demandeDetails){
        const {data: sourceData, error: sourceError } = await supabase
        .from("stock_detail")
        .select("id, quantite")
        .eq("id_stock", source)
        .eq("id_produit", id_produit)
        if (sourceError) {
            return res.status(400).json({ error: sourceError.message });
          }
    
          if (!sourceData.length) {
            return res.status(400).json({ error: `No stock found for product ${id_produit}` });
          }
    
          // Compute new stock quantity
          const currentQuantity = sourceData[0].quantite;
          const newQuantity = currentQuantity - quantite;
           // Update stock quantity
        const { error: updateStockError } = await supabase
        .from("stock_detail")
        .update({ quantite: newQuantity, last_modified: new Date() })
        .eq("id_stock", source)
        .eq("id_produit", id_produit);

      if (updateStockError) {
        return res.status(400).json({ error: `Failed to update stock for product ${id_produit}` });
      }
      }
      return res.status(200).json({
        message: "Reception accepted, stock updated successfully.",
        reception: receptionData[0],
        demandeDetails,
      });
  
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  },
  


}
module.exports = receptions;