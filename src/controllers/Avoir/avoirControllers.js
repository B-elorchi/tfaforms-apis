const { supabase } = require("../../config/supabase");

const controllers ={
    createAvoir : async (req, res) => {
        const { id_vente } = req.body;
        if (!id_vente) {
            return res.status(400).json({ error: 'id_vente is required!' });
        }
    
        try {
            // Fetch vente info
            const { data: venteData, error: venteError } = await supabase
                .from('ventes')
                .select('*')
                .eq('id', id_vente)
                .single();
    
            if (venteError) return res.status(400).json({ error: venteError.message });
            if (!venteData) return res.status(404).json({ error: 'This commande does not exist!' });
    
            // ✅ Check if the vente status is already "avoir"
            if (venteData.status === 'avoir') {
                return res.status(400).json({ error: 'Avoir already created for this vente!' });
            }
    
            // Fetch vente details
            const { data: details, error: detailsError } = await supabase
                .from('ventes_detail')
                .select('*')
                .eq('id_vente', id_vente);
    
            if (detailsError) return res.status(400).json({ error: detailsError.message });
            if (!details || details.length === 0) {
                return res.status(404).json({ error: 'No details found! Vente status not updated.' });
            }
    
            // Fetch stock ID of the vendeur
            const { data: stockData, error: stockError } = await supabase
                .from('stock')
                .select('id')
                .eq('responsable', venteData.id_vendeur)
                .eq('type', 'Vehicule');
    
            if (stockError) return res.status(400).json({ error: stockError.message });
            if (!stockData || stockData.length === 0) {
                return res.status(404).json({ error: 'This vendeur has no stock car' });
            }
            const id_stock = stockData[0].id;
    
            // Increase stock quantity or insert if it doesn't exist
            const returnStock = await Promise.all(
                details.map(async (d) => {
                    // Check if stock_detail exists
                    const { data: existingStock, error: fetchError } = await supabase
                        .from('stock_detail')
                        .select('*')
                        .eq('id_produit', d.id_produit)
                        .eq('id_stock', id_stock);
    
                    if (fetchError) throw new Error(fetchError.message);
    
                    if (existingStock && existingStock.length > 0) {
                        // If stock detail exists, update it
                        const newQuantity = existingStock[0].quantite + d.quantite;
                        const { data: updatedData, error: updateError } = await supabase
                            .from('stock_detail')
                            .update({ quantite: newQuantity })
                            .eq('id_produit', d.id_produit)
                            .eq('id_stock', id_stock)
                            .select('*');
    
                        if (updateError) throw new Error(updateError.message);
                        return updatedData[0];
                    } else {
                        // If stock detail doesn't exist, insert a new record
                        const { data: insertData, error: insertError } = await supabase
                            .from('stock_detail')
                            .insert([{ id_produit: d.id_produit, id_stock, quantite: d.quantite }])
                            .select('*');
    
                        if (insertError) throw new Error(insertError.message);
                        return insertData[0];
                    }
                })
            );
    
            // ✅ Update vente status only if stock update was successful
            if (returnStock.length > 0) {
                const { error: updateError } = await supabase
                    .from('ventes')
                    .update({ status: 'avoir' })
                    .eq('id', id_vente);
    
                if (updateError) return res.status(400).json({ error: updateError.message });
                const createAvoir = await supabase
                .from("avoir")
                .insert({id_vente})
                .select('*')
                if(createAvoir.error){
                    return res.status(400).json({error: createAvoir.error})
                }

                const updateTransaction = await supabase
                .from('transaction_solde') 
                .update({status: 'cancel'}) 
                .eq('id_vente', id_vente);
                if(updateTransaction.error){
                    return res.status(400).json({error: updateTransaction.error})
                }
                // return res.status(200).json({message: 'Transaction updated successfully!'})
                return res.status(200).json(createAvoir.data[0]);
            }
  // update current solde

        } catch (err) {
            console.error('Server Error:', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                detail: err.message,
            });
        }
    },
    createDetail: async (req, res) => {
        const { id_avoir, products } = req.body;

        // Validate request body
        if (!id_avoir || !products || products.length === 0) {
          return res.status(400).json({ error: "id_avoir and products are required!" });
        }
      
        try {
          // Fetch `avoir` and related `ventes`
          const { data: fetchVente, error: fetchVenteError } = await supabase
            .from('avoir')
            .select('*, ventes(*)')
            .eq('id', id_avoir);
      console.log({error: fetchVenteError})
          if (fetchVenteError) return res.status(400).json({ error: fetchVenteError });
          if (!fetchVente || fetchVente.length === 0) return res.status(404).json({ error: 'No avoir found!' });
      
          const vente = fetchVente[0].ventes;
      
          // Fetch RPP of the vendeur
          const { data: getRPP, error: getRPPError } = await supabase
            .from('users')
            .select('id_rpp')
            .eq('id', vente.id_vendeur);
      
          if (getRPPError) return res.status(400).json({ error: getRPPError });
          if (!getRPP || getRPP.length === 0) return res.status(404).json({ error: 'This vendeur has no RPP' });
      
          const id_rpp = getRPP[0].id_rpp;
      
          // Fetch intervalle
          const getIntervalle = await supabase
            .from('RPP')
            .select('id_intervalle, intervalle(intervalle)')
            .eq('id_name', id_rpp)
            .eq('id_indice', vente.id_indice);
      // console.log({all: JSON.stringify(getIntervalle)})
          if (getIntervalle.error) return res.status(400).json({ error: getIntervalle.error });
          if (!getIntervalle.data || getIntervalle.data.length === 0) return res.status(404).json({ error: 'No intervalle found' });
      
          const intervalle = getIntervalle.data[0].intervalle.intervalle;
      // console.log('intervalle',intervalle)
          // Calculate total quantity
          const totalQuantity = products.reduce((sum, p) => sum + p.quantite, 0);
      
          if (
            (totalQuantity < intervalle[0] && totalQuantity > intervalle[1]) ||
            (totalQuantity < intervalle[0] && intervalle[1] === "∞")
          ) {
            return res.status(400).json({ error: `The total quantity is not within the allowed interval: ${intervalle}` });
          }
      
          // Calculate total price
          let totalPrice = 0;
          const productDetails = await Promise.all(
            products.map(async (p) => {
              const { data: productPrice, error: priceError } = await supabase
                .from('PrixIndice')
                .select('prix_collisage')
                .eq('id_produit', p.id_produit)
                .eq('id_indice', vente.id_indice);
      
              if (priceError) return res.status(400).json({ error: priceError });
              if (!productPrice || productPrice.length === 0)
                return res.status(404).json({ error: 'You must define a price for this product in this indice!' });
              const prixCollisage = productPrice[0].prix_collisage;
               totalPrice = products.reduce((sum, p) => sum + (p.quantite * (productPrice?.[0]?.prix_collisage || 0)), 0);
      
              return { ...p, prix_collisage: prixCollisage };
            })
          );
      
          // Fetch stock ID of the vendeur
          const { data: stockData, error: stockError } = await supabase
            .from('stock')
            .select('id')
            .eq('responsable', vente.id_vendeur)
            .eq('type', 'Vehicule');
      
          if (stockError) return res.status(400).json({ stockError: stockError });
          if (!stockData || stockData.length === 0) return res.status(404).json({ error: 'This vendeur has no stock car' });
      
          const id_stock = stockData[0].id;
      
          // Update stock quantity
          const updatedStock = await Promise.all(
            productDetails.map(async (d) => {
              const { data: existingStock, error: fetchError } = await supabase
                .from('stock_detail')
                .select('*')
                .eq('id_produit', d.id_produit)
                .eq('id_stock', id_stock);
      
              if (fetchError) throw new Error(fetchError);
      
              if (existingStock && existingStock.length > 0) {
                // Update stock quantity
                const newQuantity = existingStock[0].quantite - d.quantite;
                const { data: updatedData, error: updateError } = await supabase
                  .from('stock_detail')
                  .update({ quantite: newQuantity })
                  .eq('id_produit', d.id_produit)
                  .eq('id_stock', id_stock)
                  .select('*');
      
                if (updateError) throw new Error(updateError);
                return updatedData[0];
              } else {
                // Insert new stock detail
                const { data: insertData, error: insertError } = await supabase
                  .from('stock_detail')
                  .insert([{ id_produit: d.id_produit, id_stock, quantite: d.quantite }])
                  .select('*');
      
                if (insertError) return res.status(404).json({insertError: insertError});
                return insertData[0];
              }
            })
          );
      //add avoir details
          const createDetails = await supabase
            .from('avoir_details')
            .insert(products.map((d) => ({ ...d, id_avoir })))
            .select('*');
            if (createDetails.error) return res.status(400).json({ createDetails: createDetails.error });
          

          // Update Avoir total price
          const { error: updateAvoirError } = await supabase
            .from('avoir')
            .update({ total_commande: totalPrice })
            .eq('id', id_avoir);
      
          if (updateAvoirError) return res.status(400).json({ updateAvoirError: updateAvoirError });
      
          return res.status(200).json({
            message: 'Details created successfully!',
            productDetails,
            totalPrice,
            updatedStock,
          });
      
        } catch (err) {
          console.error('Server Error:', err);
          return res.status(500).json({
            success: false,
            message: 'Internal server error',
            detail: err.message,
          });
        }
    }, 
    getALL: async (req, res) => {
      try {
        const fetchAll = await supabase
          .from('avoir')
          .select('*');
        
        if (fetchAll.error) {
          return res.status(400).json({ error: fetchAll.error });
        }
        
        if (fetchAll.data.length === 0) {
          return res.status(200).json({ error: 'No Avoir found' });
        }
        
        const avoirs = fetchAll.data;
    
        // Fetch the details for each avoir
        const fetchDetails = await Promise.all(
          avoirs.map(async (avoir) => {
            const getAvoirDetails = await supabase
              .from('avoir_details')
              .select('*')
              .eq('id_avoir', avoir.id);
            
            if (getAvoirDetails.error) {
              // Collect errors, do not send response immediately
              return { error: getAvoirDetails.error };
            }
    
            return getAvoirDetails.data;
          })
        );
    
        // Prepare a detailed list combining both 'avoirs' and their 'details'
        const detailedAvoirs = avoirs.map((avoir, index) => ({
          ...avoir,
          details: fetchDetails[index].error ? null : fetchDetails[index], // Handle errors gracefully
          // error: fetchDetails[index].error ? fetchDetails[index].error : null,
        }));
    
        return res.status(200).json({ avoirs: detailedAvoirs });
    
      } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          detail: err.message,
        });
      }
    },
    getById: async (req, res) => {
      const { id } = req.params; // Get the ID from the URL parameters
    
      try {
        // Fetch the 'avoir' by ID
        const fetchAvoir = await supabase
          .from('avoir')
          .select('*')
          .eq('id', id)
          .single(); // Using `.single()` to ensure we get one result, or null if not found
        
        if (fetchAvoir.error) {
          return res.status(400).json({ error: fetchAvoir.error });
        }
    
        if (!fetchAvoir.data) {
          return res.status(404).json({ error: 'Avoir not found' });
        }
    
        const avoir = fetchAvoir.data;
    
        // Fetch the details for the specific 'avoir'
        const fetchDetails = await supabase
          .from('avoir_details')
          .select('*')
          .eq('id_avoir', avoir.id);
    
        if (fetchDetails.error) {
          return res.status(400).json({ error: fetchDetails.error });
        }
    
        // Return the 'avoir' along with its details
        return res.status(200).json({
          id: avoir.id,
          title: avoir.title,
          description: avoir.description,
          details: fetchDetails.data,
        });
    
      } catch (err) {
        console.error('Server Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          detail: err.message,
        });
      }
    }
       
}
module.exports = controllers;