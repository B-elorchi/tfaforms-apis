const { supabase } = require("../../config/supabase");
const { getOne } = require("../zones/zoneControllers");


const controllers={
    addListe: async (req, res) => {
        const { name, intervalle } = req.body;
        if (!name || !intervalle || !Array.isArray(intervalle) || intervalle.length === 0) {
            return res.status(400).json({ error: "Nom and a valid intervalle array are required!" });
        }
    
        try {
            // Sort intervalle from smallest to greatest
            intervalle.sort((a, b) => a - b);
    
            // Prepare intervalles
            const intervalles = [];
            intervalles.push(["0", `${intervalle[0]}`]); // Starting interval
            for (let i = 1; i < intervalle.length; i++) {
                intervalles.push([`${intervalle[i - 1] + 1}`, `${intervalle[i]}`]);
            }
            intervalles.push([`${intervalle[intervalle.length - 1] + 1}`, "∞"]); // End interval
    
            // Insert new list
            const createListe = await supabase
                .from('liste_intervalles')
                .insert({ name })
                .select('*');
    
            if (createListe.error) {
                return res.status(400).json({ error: createListe.error.message });
            }
            const id_liste = createListe.data[0].id;
    
            // Insert intervalles
            const insertPromises = intervalles.map(interval => 
                supabase
                    .from('intervalle')
                    .insert({ id_liste, intervalle: interval })
                    .select('*')
            );
    
            // Wait for all insertions to complete
            const insertResults = await Promise.all(insertPromises);
    
            // If any insertion fails, respond with the first error encountered
            const error = insertResults.find(result => result.error);
            if (error) {
                return res.status(400).json({ error: error.error.message });
            }
    
            // Return the created liste and intervalles
            return res.status(200).json({
                liste: createListe.data[0],
                sous_liste: insertResults.map(result => result.data[0])
            });
    
        } catch (error) {
            console.error('Error during insertion:', error);
            return res.status(500).json({ error: error.message });
        }
    },
    
    getListes: async (req, res) => {
        try {
            // Fetch all listes
            const response = await supabase
                .from('liste_intervalles')
                .select('*');

            if (response.error) {
                return res.status(400).json({ error: response.error.message });
            }

            if (response.data.length === 0) {
                return res.status(404).json({ error: "No lists found!" });
            }

            const listes = response.data;

            // Fetch intervals for each list and structure the response
            const listesAvecIntervalles = await Promise.all(
                listes.map(async (liste) => {
                    // Fetch intervals for the current liste
                    const intervallesResponse = await supabase
                        .from('intervalle')
                        .select('id, intervalle')
                        .eq('id_liste', liste.id);

                    if (intervallesResponse.error) {
                        throw new Error(intervallesResponse.error.message);
                    }

                    // Structure the list with its intervals
                    return {
                        id: liste.id,
                        name: liste.name,
                        created_at: liste.created_at,
                        intervalles: intervallesResponse.data.map((interval) => ({
                            id: interval.id,
                            intervalle: interval.intervalle,
                        })),
                    };
                })
            );

            // Send the final structured response
            return res.status(200).json(listesAvecIntervalles);
        } catch (error) {
            console.error('Error fetching listes:', error);
            return res.status(500).json({ error: error.message });
        }
    },
    
    getOneListe: async (req, res) => {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: "id is required!" });
        }
    
        try {
            // Récupérer la liste
            const response = await supabase
                .from('liste_intervalles')
                .select('*')
                .eq('id', id);
    
            if (response.error) {
                return res.status(400).json({ error: response.error.message });
            }
            if (response.data.length === 0) {
                return res.status(404).json({ error: "List not found!" });
            }
    
            const liste = response.data[0];
    
            // Récupérer les intervalles pour la liste
            const intervallesResponse = await supabase
                .from('intervalle')
                .select('*')
                .eq('id_liste', liste.id);
    
            if (intervallesResponse.error) {
                throw new Error(intervallesResponse.error.message);
            }
            const details = intervallesResponse.data.map(({ intervalle, id }) => ({
                id: id,
                intervalle:intervalle
            }));
            const {name, created_at} = liste;
            return res.status(200).json({
                name: name,
                created_at: created_at,
                intervalles:details
            });
        } catch (error) {
            console.error('Error during fetching liste:', error);
            return res.status(500).json({ error: error.message });
        }
    },
}
module.exports = controllers;