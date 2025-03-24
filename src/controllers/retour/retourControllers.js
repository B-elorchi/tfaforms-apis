const { supabase } = require("../../config/supabase");

const controllers = {
  addRetour: async (req, res) => {
    const { id_vendeur, id_client, produits, cause } = req.body;
  
    if (!id_vendeur || !id_client || !cause || !produits || produits.length === 0) {
      return res.status(400).json({ error: "id_vente and cause are required!" });
    }
  
    try {
      // Get vendeur stock
      const { data: stock, error: stockError } = await supabase
        .from("stock")
        .select("*")
        .eq("responsable", id_vendeur)
        .eq("type", "Vehicule");
  
      if (stockError || !stock) {
        throw new Error(stockError || "Vendeur has no stock");
      }
  
      // Get vendeur zone
      const { data: zone, error: zoneError } = await supabase
        .from("zone_vendeur")
        .select("id_zone")
        .eq("id_vendeur", id_vendeur);
  
      if (zoneError || !zone) {
        throw new Error(zoneError || "Vendeur has no zone");
      }
  
      // Get entrepôt stock
      const getStock = await supabase
        .from("stock")
        .select("*")
        .like("type", "Depot%")
        .eq("id_zone", zone[0].id_zone);
  console.log('getStock:',getStock)
  if(getStock.error){
    return res.status(400).json({error: getStock.error.message});
  }
      if (getStock.data.length === 0) {
        return res.status(404).json({ error: "Entrepot not found" });
      }
  
      // If cause is "defectueux", handle stock modifications
      let validation = false;
      if (cause.toLowerCase() === "defectueux") {
        validation = true;
  
        // Decrease vendeur stock
        await Promise.all(
          produits.map(async (produit) => {
            const { data: existingStock, error: fetchError } = await supabase
              .from("stock_detail")
              .select("*")
              .eq("id_produit", produit.id_produit)
              .eq("id_stock", stock[0].id);
  
            if (fetchError) throw new Error(fetchError.message);
  
            if (existingStock && existingStock.length > 0) {
              const newQuantity = existingStock[0].quantite - produit.quantite;
  
              const { error: updateError } = await supabase
                .from("stock_detail")
                .update({ quantite: newQuantity, last_modified: new Date() })
                .eq("id_produit", produit.id_produit)
                .eq("id_stock", stock[0].id);
  
              if (updateError) throw new Error(updateError.message);
            } else {
              const { error: insertError } = await supabase
                .from("stock_detail")
                .insert([{ id_produit: produit.id_produit, id_stock: stock[0].id, quantite: -produit.quantite }]);
  
              if (insertError) throw new Error(insertError.message);
            }
          })
        );
  
        // Increase entrepôt stock
        await Promise.all(
          produits.map(async (produit) => {
            const { data: stockDetail, error: stockDetailError } = await supabase
              .from("stock_detail")
              .select("id, quantite")
              .eq("id_stock", getStock.data[0].id)
              .eq("id_produit", produit.id_produit)
              .eq("type", "R");
  
            if (stockDetailError) throw new Error(stockDetailError.message);
  
            if (stockDetail.length > 0) {
              const newQuantity = stockDetail[0].quantite + produit.quantite;
  
              const { error: updateError } = await supabase
                .from("stock_detail")
                .update({ quantite: newQuantity, last_modified: new Date() })
                .eq("id_produit", produit.id_produit)
                .eq("type", "R")
                .eq("id", stockDetail[0].id);
  
              if (updateError) throw new Error(updateError.message);
            } else {
              const { error: insertError } = await supabase
                .from("stock_detail")
                .insert([{ id_stock: getStock.data[0].id, id_produit: produit.id_produit, quantite: produit.quantite, type: "R" }]);
  
              if (insertError) throw new Error(insertError.message);
            }
          })
        );
      }
  const causeLower = cause.toLowerCase();
      // Insert retour
      const { data: retourData, error: addRetourError } = await supabase
        .from("retour")
        .insert({ id_vendeur, id_client, cause:causeLower, validation })
        .select("*");
  
      if (addRetourError || !retourData || retourData.length === 0) {
        throw new Error("Failed to create retour");
      }
  
      // Insert retour details
      const { error: insertDetailError } = await supabase
        .from("retour_detail")
        .insert(produits.map((produit) => ({ id_retour: retourData[0].id, ...produit })));
  
      if (insertDetailError) throw new Error(insertDetailError.message);
  
      return res.status(200).json({
        message: "Retour added successfully",
        retour: retourData[0],
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
  updateDetail:async (req, res) => {
    const {id} = req.params; // id detail
    if(!id){
      return res.status(400).json({error: "id is required!"});
    }
    try{
      const updatedDetail = await supabase.from("retour_detail").update(req.body).eq("id", id).select("*");
      if(updatedDetail.error){
        return res.status(400).json({error: updatedDetail.error.message});
      }
      if(updatedDetail.data.length === 0){
        return res.status(404).json({error: "Detail not found"});
      }
      return res.status(200).json(updatedDetail.data[0]);

    }catch(error){
      console.error("Error during updating detail:", error);
      return res.status(500).json({error: "Something went wrong", error});
    }
  },

 
  getRetours: async (req, res) => {
    try {
      const response = await supabase.from("retour").select("*, client:users!retour_id_client_fkey(id, name), vendeur:users!retour_id_vendeur_fkey(id, name)");
      if (response.error) {
        return res.status(400).json({ error: response.error.message });
      }
      const retours = response.data;
      console.log(retours);
      const getDetails = await Promise.all(
        retours.map(async (retour) => {
          const details = await supabase.from("retour_detail").select("*, Produits(id, nomProduit)").eq("id_retour", retour.id);
          console.log('details', details);
          return { ...retour, details: details.data };
        })
      );
      if(getDetails.error){
        return res.status(400).json({ error: getDetails.error.message });
      }
      return res.status(200).json(getDetails);
    } catch (error) {
      console.error("Error during fetching retour:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  getRetour: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    try {
      const response = await supabase.from("retour").select("*,client:users!retour_id_client_fkey(id, name), vendeur:users!retour_id_vendeur_fkey(id, name)").eq("id", id);
      if (response.error) {
        return res.status(400).json({ error: response.error.message });
      }
      // return res.status(200).json(response.data[0]);
      const getDetails =  await supabase.from("retour_detail").select("*, Produits(id, nomProduit)").eq("id_retour", response.data[0].id);
          console.log('details', getDetails);
       
      if(getDetails.error){
        return res.status(400).json({ error: getDetails.error.message });
      }
      return res.status(200).json( { ...response.data[0], details: getDetails.data });
    } catch (error) {
      console.error("Error during fetching retour:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  updateCause: async (req, res) => {
    const {id} = req.params; // id retour
    if(!id){
      return res.status(400).json({error: "id is required!"});
    }
    try{
      const updatedRetour = await supabase.from("retour").update(req.body).eq("id", id).select("*");
      if(updatedRetour.error){
        return res.status(400).json({error: updatedRetour.error.message});
      }
      if(updatedRetour.data.length === 0){
        return res.status(404).json({error: "Retour not found"});
      }
      return res.status(200).json(updatedRetour.data[0]);
  }catch(error){
    console.error("Error during updating retour:", error);
    return res.status(500).json({error: "Something went wrong", error});
  }
},
valider: async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "id is required!" });
  }

  try {
    // Get retour
    const { data: retourData, error: retourError } = await supabase.from("retour").select("*").eq("id", id);
    if (retourError) return res.status(400).json({ error: retourError.message });
    if (!retourData || retourData.length === 0) return res.status(404).json({ error: "Retour not found!" });

    const id_vendeur = retourData[0].id_vendeur;

    // Get retour details
    const { data: produits, error: detailError } = await supabase.from("retour_detail").select("*").eq("id_retour", id);
    if (detailError) return res.status(400).json({ error: detailError.message });

    // Get vendeur stock
    const { data: stock, error: stockError } = await supabase.from("stock").select("*").eq("responsable", id_vendeur).eq("type", "Vehicule");
    if (stockError || !stock || stock.length === 0) return res.status(400).json({ error: "Vendeur has no stock" });

    // Get vendeur zone
    const { data: zone, error: zoneError } = await supabase.from("zone_vendeur").select("id_zone").eq("id_vendeur", id_vendeur);
    if (zoneError || !zone || zone.length === 0) return res.status(400).json({ error: "Vendeur has no zone" });

    // Get entrepôt stock
    const { data: entrepotStock, error: entrepotStockError } = await supabase.from("stock").select("*").like("type", "Depot%").eq("id_zone", zone[0].id_zone);
    if (entrepotStockError || !entrepotStock || entrepotStock.length === 0) return res.status(404).json({ error: "Entrepot not found" });

    // Update vendeur stock
    await Promise.all(
      produits.map(async (produit) => {
        const { data: existingStock, error: fetchError } = await supabase
          .from("stock_detail")
          .select("*")
          .eq("id_produit", produit.id_produit)
          .eq("id_stock", stock[0].id);

        if (fetchError) return res.status(400).json({ error: fetchError.message });

        const newQuantity = existingStock.length > 0 ? existingStock[0].quantite - produit.quantite : -produit.quantite;

        const { error: stockUpdateError } = await supabase
          .from("stock_detail")
          .upsert([{ id_produit: produit.id_produit, id_stock: stock[0].id, quantite: newQuantity, last_modified: new Date() }]);

        if (stockUpdateError) return res.status(400).json({ error: stockUpdateError.message });
      })
    );

    // Update entrepôt stock
    await Promise.all(
      produits.map(async (produit) => {
        const { data: stockDetail, error: stockDetailError } = await supabase
          .from("stock_detail")
          .select("id, quantite")
          .eq("id_stock", entrepotStock[0].id)
          .eq("id_produit", produit.id_produit)
          .eq("type", "R");

        if (stockDetailError) return res.status(400).json({ error: stockDetailError.message });

        const newQuantity = stockDetail.length > 0 ? stockDetail[0].quantite + produit.quantite : produit.quantite;

        const { error: updateStockError } = await supabase
          .from("stock_detail")
          .upsert([{ id_stock: entrepotStock[0].id, id_produit: produit.id_produit, quantite: newQuantity, type: "R", last_modified: new Date() }]);

        if (updateStockError) return res.status(400).json({ error: updateStockError.message });
      })
    );

    // Validate retour
    const { error: updateRetourError } = await supabase.from("retour").update({ validation: true }).eq("id", id);
    if (updateRetourError) return res.status(400).json({ error: updateRetourError.message });

    return res.status(200).json({ message: "Retour validated successfully" });

  } catch (error) {
    console.error("Error during retour validation:", error);
    return res.status(500).json({ error: "Something went wrong", details: error.message });
  }
}

};
module.exports = controllers;
