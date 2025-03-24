const { supabase } = require("../../config/supabase");
const { get } = require("../../routes/demandesRoutes");

const controllers = {
  addCategory: async (req, res) => {
    const { categorieName, description, image, status } = req.body;

    // Input validation
    if (!categorieName) {
      return res.status(400).json({ error: "categorieName are required!" });
    }

    try {
      // Insert new Category
      const addCategory = await supabase
        .from("Product_category")
        .insert({
          categorieName,
          description,
          image,
          status,
          updated_at: new Date(),
        })
        .select("*");

      if (addCategory.error) {
        throw new Error(addCategory.error.message);
      }

      // Return success response
      return res.status(200).json({
        message: "Category added successfully",
        category: addCategory.data[0],
      });
    } catch (error) {
      // Catch and return errors
      return res.status(400).json({ error: error.message });
    }
  },

  updateCategory: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    const { categorieName, description, image, is_deleted } = req.body;
    const updateCategory = await supabase
      .from("Product_category")
      .update({
        categorieName,
        description,
        image,
        is_deleted,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select("*");
    if (updateCategory.error) {
      return res.status(400).json({ error: updateCategory.error.message });
    }
    return res.status(200).json({
      message: "Category updated successfully",
      category: updateCategory.data[0],
    });
  },
  updateCategoryStatus: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    const { status } = req.body;
    const updateCategory = await supabase
      .from("Product_category")
      .update({ status, updated_at: new Date() })
      .eq("id", id)
      .select("*");
    if (updateCategory.error) {
      return res.status(400).json({ error: updateCategory.error.message });
    }
    return res.status(200).json({
      message: "Category updated successfully",
      category: updateCategory.data[0],
    });
  },
  getCategories: async (req, res) => {
    try {
      const response = await supabase.from("Product_category").select("*");
      if (response.error) {
        return res.status(400).json({ error: response.error.message });
      }
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Error during fetching category:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },
  getCategory: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    try {
      const response = await supabase
        .from("Product_category")
        .select("*")
        .eq("id", id);
      if (response.error) {
        return res.status(400).json({ error: response.error.message });
      }
      return res.status(200).json(response.data[0]);
    } catch (error) {
      console.error("Error during fetching category data:", error);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  getCategoriesWithProducts: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required!" });
    }

    try {
      const { data: userCategories, error: categoryError } = await supabase
        .from("vendeur_category")
        .select("id_category")
        .eq("id_vendeur", id);

      if (categoryError) {
        return res.status(400).json({ error: categoryError.message });
      }

      if (!userCategories || userCategories.length === 0) {
        return res
          .status(404)
          .json({ error: "No categories found for this user!" });
      }

      const categoryIds = userCategories.map((cat) => cat.id_category);

      const { data: categories, error: fullCategoryError } = await supabase
        .from("Product_category")
        .select("*")
        .in("id", categoryIds)
        .eq("status", true);

      if (fullCategoryError) {
        return res.status(400).json({ error: fullCategoryError.message });
      }

      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const { data: products, error: productError } = await supabase
            .from("Produits")
            .select("*")
            .eq("idCategory", category.id)
            .eq("is_deleted", false)
            .eq("status", true);

          if (productError) {
            console.log(
              `Product error for category ${category.id}:`,
              productError
            );
            return { ...category, products: [] };
          }

          console.log(
            `Found ${products.length} products for category ${category.id}`
          );
          return { ...category, products };
        })
      );

      return res.status(200).json(categoriesWithProducts);
    } catch (error) {
      console.error("Error fetching categories and products:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  assignVendeursToCategory: async (req, res) => {
    const { categoryId, vendeurIds } = req.body;

    if (
      !categoryId ||
      !vendeurIds ||
      !Array.isArray(vendeurIds) ||
      vendeurIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Category ID and vendeur IDs are required!" });
    }

    try {
      const records = vendeurIds.map((vendeurId) => ({
        id_vendeur: vendeurId,
        id_category: categoryId,
      }));

      const { data, error } = await supabase
        .from("vendeur_category")
        .insert(records);

      if (error) {
        return res.status(400).json({
          error: "Failed to assign vendeurs to category",
          details: error.message,
        });
      }

      return res
        .status(200)
        .json({ message: "Vendeurs assigned to category successfully!", data });
    } catch (error) {
      console.error("Error assigning vendeurs to category:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  },
  getVendeursForCategory: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Category ID is required!" });
    }
    try {
      const { data: vendeurs, error } = await supabase
        .from("vendeur_category")
        .select("id_vendeur, users(id, name)")
        .eq("id_category", id);
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      if (!vendeurs || vendeurs.length === 0) {
        return res
          .status(404)
          .json({ error: "No vendeurs found for this category!" });
      }
      const result = vendeurs.map((vendeur) => ({
        id: vendeur.id_vendeur,
        name: vendeur.users.name,
      }));
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching vendeurs for category:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
module.exports = controllers;
