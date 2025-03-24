const { supabase } = require("../../config/supabase");

const controllers ={
    addZone: async (req, res) => {
        const { Nom, geoCode, id_ville } = req.body;
    
        // Validation des entrées
        if (!Nom) {
            return res.status(400).json({ error: "Nom est requis !" });
        }
    
        try {
            // Ajout dans la base de données
            const addZone = await supabase
                .from('zones')
                .insert({
                    Nom,
                    geoCode,
                    id_ville,
                    created_at: new Date(),
                    Last_modified: new Date(),
                })
                .single();
    
            // Gestion des erreurs 
            if (addZone.error) {
                throw new Error(addZone.error.message);
            }
    
            // Réponse en cas de succès
            return res.status(201).json({
                message: "Zone ajoutée avec succès"
            });
        } catch (error) {
            console.error('Erreur lors de l’ajout de la zone :', error.message);
            return res.status(500).json({ error: `Une erreur s'est produite. Veuillez réessayer plus tard.\n ${error}`});
        }
    },
    
    updateZone: async(req, res) => { 
        const id = req.params.id;
        if(!id){
            return res.status(400).json({error: "id is required!"});
        }
        const {Nom, geoCode,status, id_ville, isDeleted} = req.body;
        const updateZone = await supabase
            .from('zones')
            .update({ Nom, geoCode,id_ville,status,isDeleted, Last_modified: new Date() })
            .eq('id', id)
            .select('*, villes(*)');
        if(updateZone.error){
            return res.status(400).json({error: updateZone.error.message});
        }
        return res.status(200).json({
            message: 'Zone updated successfully',
            zone: updateZone.data[0]
        })
    },
    getAll: async(req, res) => {
        try{
        const response = await supabase
            .from('zones')
            .select('*, villes(*)');
            if(response.error){
                return res.status(400).json({error: response.error.message});
            }
            return res.status(200).json(response.data);
        }catch(error){
            console.error('Error during fetching zones:', error);
            return res.status(500).json({error: error});
        }
      
    },
    getOne: async(req, res) => {
        const id = req.params.id;
        if(!id){
            return res.status(400).json({error: "id is required!"});
        }
        try{                    

        const response = await supabase
            .from('zones')
            .select('*, villes(*)')
            .eq('id', id);
        if(response.error){
            return res.status(400).json({error: response.error.message});
        }
        return res.status(200).json(response.data[0]);
    }catch(error){
        console.error('Error during fetching zone:', error);
        return res.status(500).json({error: error});
    }
},
AssignToZone: async (req, res) => {
    const { id_vendeur, id_zone } = req.body;

    if (!id_vendeur || !id_zone) {
        return res.status(400).json({ error: "id_vendeur and id_zone are required!" });
    }

    try {
        // Check if the vendeur already exists in any zone
        const { data: existingAssignments, error: existingError } = await supabase
            .from("zone_vendeur")
            .select("id_zone")
            .eq("id_vendeur", id_vendeur);

        if (existingError) {
            return res.status(400).json({ error: existingError.message });
        }

        if (existingAssignments.length > 0) {
            // If the vendeur is already assigned to the same zone, return an error
            if (existingAssignments[0].id_zone === id_zone) {
                return res.status(400).json({ error: "Vendeur is already assigned to this zone!" });
            }

            // Update zone if the vendeur exists in another zone
            const { error: updateError } = await supabase
                .from("zone_vendeur")
                .update({ id_zone })
                .eq("id_vendeur", id_vendeur);

            if (updateError) {
                return res.status(400).json({ error: updateError.message });
            }

            return res.status(200).json({ message: "Vendeur reassigned to new zone successfully!" });
        }

        // If the vendeur is not assigned to any zone, insert a new entry
        const { data: newAssignment, error: insertError } = await supabase
            .from("zone_vendeur")
            .insert({ id_vendeur, id_zone })
            .select("*")
            .single();

        if (insertError) {
            return res.status(400).json({ error: insertError.message });
        }

        return res.status(201).json({ message: "Vendeur assigned successfully!", zone: newAssignment });
    } catch (error) {
        console.error("Error during assignment:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
},

unassignFromZone: async (req, res) => {
    const { id_vendeur, id_zone } = req.body;
    if (!id_vendeur || !id_zone) {
        return res.status(400).json({ error: "id_vendeur and id_zone are required!" });
    }

    try {
        // Check if the vendeur is assigned to the zone
        const fetchData = await supabase
            .from('zone_vendeur')
            .select('*')
            .eq('id_vendeur', id_vendeur)
            .eq('id_zone', id_zone);

        if (fetchData.error) {
            return res.status(400).json({ error: fetchData.error.message });
        }

        if (!fetchData.data.length) {
            return res.status(400).json({ error: "Vendeur is not assigned to this zone!" });
        }

        // Delete the assignment
        const deleteZone = await supabase
            .from('zone_vendeur')
            .delete()
            .eq('id_vendeur', id_vendeur)
            .eq('id_zone', id_zone)
            .select('*');

        if (deleteZone.error) {
            return res.status(400).json({ error: deleteZone.error.message });
        }

        return res.status(200).json({
            message: 'Vendeur désaffecté avec succès',
            zone: deleteZone.data[0],
        });
    } catch (error) {
        console.error('Error during unassignment:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
},
getVendeur: async (req, res) => {
    const { id} = req.params;
    if (!id ) {
        return res.status(400).json({ error: ' id is required!' });
    }

    try {
        const { data, error } = await supabase
            .from('zone_vendeur')
            .select('users(name, id, phone, statut)')
            .eq('id_zone', id);

        if (error) {
            return res.status(400).json({ error: error.message || 'Error fetching vendeur data' });
        }

        if (data.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json({
            id_zone: id,
            vendeurs: data.map((item) => {
                return { id: item.users.id, name: item.users.name, phone: item.users.phone, statut:item.users.statut}; // Explicitly return the object
            })
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
};
module.exports = controllers;