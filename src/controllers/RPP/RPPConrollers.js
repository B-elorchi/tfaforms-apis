const { supabase } = require("../../config/supabase");

const controllers = {
  //     createRPP: async (req, res)=>{
  //         const {id_vendeur, id_intervalle, id_indice}= req.body;
  //         if(!id_vendeur || !id_intervalle || !id_indice){
  //             return res.status(400).json({error: "Missing required fields: id_vendeur, id_intervalle, id_indice"});
  //         }
  //         try{
  //             const RPP= await supabase
  //             .from("RPP")
  //             .insert({
  //                 id_vendeur,
  //                 id_intervalle,
  //                 id_indice
  //             })
  //             .select("*");
  //             if(RPP.error){
  //                 throw new Error(RPP.error.message);
  //             }
  //             res.status(201).json({message: "RPP created successfully", data: RPP.data[0]});
  //     }
  //     catch(error){
  //         res.status(400).json({error: error.message});
  //     }
  // },
  createRPP: async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required!" });
    }

    try {
      // Check if the name already exists
      const { data: existingRPP, error: checkError } = await supabase
        .from("RPP_name")
        .select("id")
        .eq("name", name)
        .single(); // Ensure we get a single record if it exists

      if (checkError && checkError.code !== "PGRST116") {
        // Ignore "no rows found" error
        return res
          .status(400)
          .json({ success: false, message: checkError.message });
      }

      if (existingRPP) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This name already exists. Please choose a different name!",
          });
      }

      // Insert the new RPP
      const { data, error } = await supabase
        .from("RPP_name")
        .insert([{ name }])
        .select("*");

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        message: "The RPP was created successfully!",
        RPP: data[0],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message,
      });
    }
  },
  createRPPDetail: async (req, res) => {
    const { id_intervalle, id_indice, id_name } = req.body;

    if (!id_intervalle || !id_indice || !id_name) {
      return res
        .status(400)
        .json({
          success: false,
          message: "id_intervalle, id_indice, and id_name are required!",
        });
    }

    try {
      // Check if the record already exists
      const { data: existingData, error: checkError } = await supabase
        .from("RPP")
        .select("*")
        .eq("id_intervalle", id_intervalle)
        .eq("id_name", id_name)
        .single(); // Get one row if it exists

      if (checkError && checkError.code !== "PGRST116") {
        return res
          .status(400)
          .json({ success: false, message: checkError.message });
      }

      let result;
      if (existingData) {
        // If the row exists, update it
        const { data, error } = await supabase
          .from("RPP")
          .update({ id_indice })
          .eq("id_intervalle", id_intervalle)
          .eq("id_name", id_name)
          .select("*");

        if (error) {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        }

        result = data[0];
      } else {
        // If no existing row, insert a new one
        const { data, error } = await supabase
          .from("RPP")
          .insert([{ id_intervalle, id_indice, id_name }])
          .select("*");

        if (error) {
          return res
            .status(400)
            .json({ success: false, message: error.message });
        }

        result = data[0];
      }

      return res.status(200).json({
        success: true,
        message: "The RPP detail was added or updated successfully!",
        detail: result,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message,
      });
    }
  },
  getAll: async (req, res) => {
    try {
      // Fetch RPP names
      const { data: rppNames, error: rppError } = await supabase
        .from("RPP_name")
        .select("*");

      if (rppError) {
        return res.status(400).json({
          success: false,
          message: "Error fetching RPP names",
          detail: rppError.message,
        });
      }

      if (!rppNames || rppNames.length === 0) {
        return res.status(200).json({ message: "No RPP found!" });
      }

      // Fetch RPP details
      const { data: rppDetails, error: detailsError } = await supabase
        .from("RPP")
        .select("*, indice(*), intervalle(*)");

      if (detailsError) {
        return res.status(400).json({
          success: false,
          message: "Error fetching RPP details",
          detail: detailsError.message,
        });
      }

      // Merge RPP names with details
      const result = rppNames.map((rpp) => ({
        id: rpp.id,
        name: rpp.name,
        id_deleted: rpp.is_deleted,
        details: rppDetails.filter((detail) => detail.id_name === rpp.id),
      }));

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message,
      });
    }
  },
  getOne: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "id is required!" });
    }

    try {
      // Fetch the RPP name
      const { data: rppNames, error: rppError } = await supabase
        .from("RPP_name")
        .select("id, name")
        .eq("id", id)
        .single(); // Ensure we get only one item, not an array

      if (rppError) {
        return res.status(400).json({
          success: false,
          message: "Error fetching RPP name",
          detail: rppError.message,
        });
      }

      if (!rppNames) {
        return res
          .status(404)
          .json({ success: false, message: "No RPP found!" });
      }

      // Fetch related RPP details (filtering directly in the query)
      const { data: rppDetails, error: detailsError } = await supabase
        .from("RPP")
        .select("*, indice(*), intervalle(*)")
        .eq("id_name", id);

      if (detailsError) {
        return res.status(400).json({
          success: false,
          message: "Error fetching RPP details",
          detail: detailsError.message,
        });
      }

      // Construct response
      const result = {
        id: rppNames.id,
        name: rppNames.name,
        details: rppDetails || [], // If no details, return an empty array
      };

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message,
      });
    }
  },
  affectRPPToZone: async (req, res) => {
    const { id_RPP, zone_ids } = req.body;
    if (!id_RPP || !zone_ids || zone_ids.length === 0) {
      return res
        .status(400)
        .json({ error: "id_RPP and zone_ids are required!" });
    }

    try {
      const affectationResults = [];

      // Loop through each zone ID
      for (const id of zone_ids) {
        const { data, error } = await supabase
          .from("zones")
          .update({
            Last_modified: new Date(),
            id_rpp_name: id_RPP,
          })
          .eq("id", id)
          .select("*");

        if (error) {
          // If error in updating zone, add the error message to the results
          affectationResults.push({ id, error: error.message });
        } else if (data.length === 0) {
          // If zone not found
          affectationResults.push({ id, error: "zone not found!" });
        } else {
          // If successful, add the affected data to results
          affectationResults.push({
            id,
            message: "RPP affected successfully!",
            data: data[0],
          });
        }
      }

      // After processing all zones, send the response
      return res.status(200).json({
        success: true,
        message: "RPP affectation completed!",
        results: affectationResults,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        detail: err.message,
      });
    }
  },
  affectRPPToVendeur: async (req, res) => {
    const { id_vendeur, id_RPP } = req.body;

    if (!id_vendeur || !id_RPP) {
      return res
        .status(400)
        .json({ error: "id_vendeur and id_RPP are required!" });
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ id_rpp: id_RPP })
        .eq("id", id_vendeur)
        .select("*");

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Vendeur not found!" });
      }

      return res.status(200).json({
        success: true,
        message: "RPP affectation completed!",
        results: data[0],
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },

  updateRPP: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    
  
    const { name, is_deleted, details } = req.body;
    
   
    const updateRpp = await supabase
      .from("RPP_name")
      .update({
        name,
        Last_modified: new Date(),
        is_deleted,
      })
      .eq("id", id)
      .select("*");
      
    if (updateRpp.error) {
      return res.status(400).json({ error: updateRpp.error.message });
    }
    
   
    if (details && Array.isArray(details)) {
    
      const deleteOld = await supabase
        .from("RPP")
        .delete()
        .eq("id_name", id);
        
      if (deleteOld.error) {
        return res.status(400).json({ error: deleteOld.error.message });
      }
      
      
      const newDetails = details.map(detail => ({
        id_intervalle: detail.id_intervalle,
        id_indice: detail.id_indice,
        id_name: id,
      }));
      
      const insertDetails = await supabase
        .from("RPP")
        .insert(newDetails)
        .select("*");
        
      if (insertDetails.error) {
        return res.status(400).json({ error: insertDetails.error.message });
      }
    }
    
    return res.status(200).json({
      message: "Rpp updated successfully",
      rpp: updateRpp.data[0],
    });
  },
  
};
module.exports = controllers;
