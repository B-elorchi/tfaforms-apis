const { supabase } = require("../../config/supabase");


const Controllers= {
addVille: async (req, res) => {
    const { nom, geoCode } = req.body;
    if (!nom) {
        return res.status(400).json({ error: "nom is required!" });
    }

    try {
        const response = await supabase
            .from('villes')
            .insert({ nom, geoCode })
            .select('*');

        if (response.error) {
            return res.status(400).json({ error: response.error.message });
        }
        return res.status(200).json(response.data[0]);
    } catch (error) {
        console.error('Error during adding ville:', error);
        return res.status(500).json({ error: error });
    }
},
updateVille: async (req, res) => {
    const id = req.params.id;
    const { nom, geoCode } = req.body;
    if (!id) {
        return res.status(400).json({ error: "id is required!" });
    }

    try {
        const response = await supabase
            .from('villes')
            .update({ nom, geoCode })
            .eq('id', id)
            .select('*');

        if (response.error) {
            return res.status(400).json({ error: response.error.message });
        }
        return res.status(200).json(response.data[0]);
    } catch (error) {
        console.error('Error during updating ville:', error);
        return res.status(500).json({ error: error });
    }
},
getVilles: async (req, res) => {
    try {
        const response = await supabase
            .from('villes')
            .select('*');

        if (response.error) {
            return res.status(400).json({ error: response.error.message });
        }
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error during fetching villes:', error);
        return res.status(500).json({ error: error });
    }
},
getOneVille: async (req, res) => {
        const id = req.params.id;
        if(!id){
            return res.status(400).json({error: "id is required!"});
        }
        try{                    

        const response = await supabase
            .from('villes')
            .select('*')
            .eq('id', id);
        if(response.error){
            return res.status(400).json({error: response.error.message});
        }
        if(response.data.length === 0){
            return res.status(404).json({error: "Ville not found!"});
        }
        return res.status(200).json(response.data[0]);
    }catch(error){
    console.error('Error during fetching ville:', error);
    return res.status(500).json({error: error});
}
},
}
module.exports = Controllers;
