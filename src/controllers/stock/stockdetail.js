const { supabase } = require("../../config/supabase");

const stockDetail= {
 updateDetail : async(req,res)=>{
    const {id} = req.params;
    if(!id){
        return res.status(400).json({error: 'id is required!'})
    }
    const {id_produit,quantite} = req.body;
    try{
const getDetail = await supabase
.from('stock_detail')
.select('*')
.eq('id_stock', id)
.eq('id_produit',id_produit);
if(getDetail.error){
    return res.status(400).json({error: getDetail.error})
}
if(getDetail.data.length === 0){
    const addProductToStock = await supabase
    .from('stock_detail')
    .insert({
        id_stock: id,
        id_produit,
        quantite
    })
    .select('*')
    if(addProductToStock.error){
        return res.status(400).json({error: addProductToStock.error})
    }
    return res.status(201).json({message: 'product added to the stock successfully!', data: addProductToStock.data[0]})
}
const updateQ = await supabase
.from('stock_detail')
.update({
    quantite
})
.eq('id_stock', id)
.eq('id_produit',id_produit);
if(updateQ.error){
    return res.status(400).json({error: error})
} 
return res.status(200).json({message: 'detail updated successfully'})
    }catch(error){
        return res.status(500).json({error: 'Internal server error',
            detail: error
        })
    }
},
updateStatus: async (req, res) => {
    const { id } = req.params; // Fixed typo (was req.paramas)
    if (!id) {
        return res.status(400).json({ error: "id is required!" });
    }

    const { status, id_produit, isDeleted } = req.body;
    if (!id_produit) {
        return res.status(400).json({ error: "id_produit is required!" });
    }

    try {
        // Update the stock detail status
        const { data, error } = await supabase
            .from("stock_detail")
            .update({ status, isDeleted })
            .eq("id_stock", id)
            .eq("id_produit", id_produit)
            .select(); // Ensure the updated row is returned

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // If no rows were updated, that means no matching record was found
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Stock detail not found!" });
        }

        return res.status(200).json({ message: "Status of product updated", data });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
            detail: error.message,
        });
    }
},

}
module.exports = stockDetail;