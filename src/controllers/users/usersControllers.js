const { supabase } = require("../../config/supabase");
const users = {
  getAllUsersWithRoles: async (req, res) => {
    try {
      const { data: users, error } = await supabase.from("users").select(`
                   *,
                    roles: user_role(id_role, role:id_role(name, slug))
                `);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }

      res.status(200).json({ data: users });
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  getClients: async (req, res) => {
    try {
        const { data: roleData, error: roleError } = await supabase
            .from("role")
            .select("id")
            .eq("name", "Client")
            .single();
        
        console.log(`role data ${roleData}`);
        console.log(`role error ${roleError}`);
        
        if (roleError || !roleData) {
            throw new Error(`Client role not found: ${roleError?.message}`);
        }
        
        const clientRoleId = roleData.id;

        const { count, error: countError } = await supabase
            .from("user_role")
            .select("*", { count: "exact", head: true })
            .eq("id_role", clientRoleId);

        if (countError) {
            return res.status(400).json({ error: countError.message });
        }

        const { data: clients, error: clientsError } = await supabase
            .from("user_role")
            .select("users(*)")
            .eq("id_role", clientRoleId);

        if (clientsError) {
            return res.status(400).json({ error: clientsError.message });
        }

        const formattedClients = clients.map((client) => client.users);

        return res.status(200).json({
            data: formattedClients,
            total: count
        });
    } catch (error) {
        console.error("getClients error:", error);
        return res.status(500).json({ error: "Internal Server Error", detail: error.message });
    }
},
  getVendeurs: async (req, res) => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Vendeur")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Vendeur role not found: ${roleError?.message}`);
      }
      const vendeurRoleId = roleData.id;

      const { data: clients, error } = await supabase
        .from("user_role")
        .select("users(*)")
        .eq("id_role", vendeurRoleId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const vendeurs = clients.map((client) => client.users);

      const vendeursWithZones = await Promise.all(
        vendeurs.map(async (vendeur) => {
          const { data: zoneData, error: zoneError } = await supabase
            .from("zone_vendeur")
            .select("zones(Nom)")
            .eq("id_vendeur", vendeur.id)
            .single();
          if (zoneError && zoneError.code !== "PGRST116") {
            console.error("Error fetching zone:", zoneError.message);
            throw new Error(zoneError.message);
          }
          return { ...vendeur, zone: zoneData?.zones?.Nom || null };
        })
      );

      res.status(200).json({ vendeurs: vendeursWithZones });
    } catch (error) {
      console.error("getVendeurs error:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  getClientById: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (userError || !user) {
        return res
          .status(404)
          .json({ error: "User not found", detail: userError?.message });
      }

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Client")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Client role not found: ${roleError?.message}`);
      }
      const clientRoleId = roleData.id;

      const { data: roles, error: roleQueryError } = await supabase
        .from("user_role")
        .select("role:role(*)")
        .eq("id_user", id)
        .eq("id_role", clientRoleId);

      if (roleQueryError) {
        return res
          .status(500)
          .json({
            error: "Error fetching roles",
            detail: roleQueryError.message,
          });
      }
      if (!roles || roles.length === 0) {
        return res.status(404).json({ error: "User is not a Client" });
      }

      res.status(200).json({
        user,
        roles: roles.map((r) => r.role),
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  getVendeurById: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }
    try {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (userError || !user) {
        return res
          .status(404)
          .json({ error: "User not found", detail: userError?.message });
      }

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Vendeur")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Vendeur role not found: ${roleError?.message}`);
      }
      const vendeurRoleId = roleData.id;

      const { data: roles, error: roleQueryError } = await supabase
        .from("user_role")
        .select("role:role(*)")
        .eq("id_user", id)
        .eq("id_role", vendeurRoleId);
      if (roleQueryError) {
        return res
          .status(500)
          .json({
            error: "Error fetching roles",
            detail: roleQueryError.message,
          });
      }
      if (!roles || roles.length === 0) {
        return res.status(404).json({ error: "User is not a Vendeur" });
      }

      const { data: zoneData, error: zoneError } = await supabase
        .from("zone_vendeur")
        .select("zones(Nom)")
        .eq("id_vendeur", id)
        .single();
      if (zoneError && zoneError.code !== "PGRST116") {
        console.error("Error fetching zone:", zoneError.message);
        throw new Error(zoneError.message);
      }

      res.status(200).json({
        user,
        roles: roles.map((r) => r.role),
        zone: zoneData?.zones?.Nom || null,
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  vendeurParPhone: async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required!" });
    }
    try {
      const { data, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();
      if (userError || !data) {
        return res.status(200).json({
          message: "User not found",
          detail: userError?.message,
        });
      }
      const user = data;

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Vendeur")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Vendeur role not found: ${roleError?.message}`);
      }
      const vendeurRoleId = roleData.id;

      const { data: roles, error: roleQueryError } = await supabase
        .from("user_role")
        .select("role:role(*)")
        .eq("id_user", user.id)
        .eq("id_role", vendeurRoleId);
      if (roleQueryError) {
        return res
          .status(500)
          .json({
            error: "Error fetching roles",
            detail: roleQueryError.message,
          });
      }
      if (!roles || roles.length === 0) {
        return res.status(404).json({ error: "User is not a Vendeur" });
      }

      res.status(200).json({
        user,
        roles: roles.map((r) => r.role),
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  clientParPhone: async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required!" });
    }
    try {
      const { data, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();
      if (userError || !data) {
        return res.status(200).json({
          message: "User not found",
          detail: userError?.message,
        });
      }
      const user = data;

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Client")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Client role not found: ${roleError?.message}`);
      }
      const clientRoleId = roleData.id;

      const { data: roles, error: roleQueryError } = await supabase
        .from("user_role")
        .select("role:role(*)")
        .eq("id_user", user.id)
        .eq("id_role", clientRoleId);
      if (roleQueryError) {
        return res
          .status(500)
          .json({
            error: "Error fetching roles",
            detail: roleQueryError.message,
          });
      }
      if (!roles || roles.length === 0) {
        return res.status(404).json({ error: "User is not a Client" });
      }

      res.status(200).json({
        user,
        roles: roles.map((r) => r.role),
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error", detail: error.message });
    }
  },

  createClient: async (req, res) => {
    const {
      phone,
      name,
      geocode,
      address,
      created_by,
      solde_actuelle,
      created_at,
    } = req.body;
    console.log("Received data:", {
      phone,
      name,
      geocode,
      solde_actuelle,
      address,
      created_by,
    });

    if (!phone || !name || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const sanitizedNom = name.replace(/\s+/g, "_");
    const safePassword = ` ${phone}#C!25`;
    const email = `${sanitizedNom}Client${phone}@gmail.com`;
    const createdBy = created_by === "" ? null : created_by;

    try {
      const { data: registerData, error: registerError } =
        await supabase.auth.signUp({
          email,
          password: safePassword,
        });
      if (registerError || !registerData?.user) {
        return res
          .status(400)
          .json({ error: registerError?.message || "SignUp failed" });
      }
      const { user } = registerData;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            email,
            phone,
            name,
            solde_actuelle: solde_actuelle ?? 0,
            geoCode: geocode,
            address,
            created_by: createdBy,
            created_at: created_at ?? new Date().toISOString(),
          },
        ])
        .select("*");
      if (userError || !userData?.length) {
        console.error("Error inserting into users table:", userError?.message);
        return res
          .status(500)
          .json({ error: userError?.message || "Failed to insert user" });
      }
      const client = userData[0];

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Client")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Client role not found: ${roleError?.message}`);
      }
      const clientRoleId = roleData.id;

      const { error: roleAssignError } = await supabase
        .from("user_role")
        .insert([
          {
            id_user: client.id,
            id_role: clientRoleId,
          },
        ]);
      if (roleAssignError) {
        console.error(
          "Error inserting into user_role table:",
          roleAssignError.message
        );
        return res.status(400).json({
          error: "User role assignment failed",
          detail: roleAssignError.message,
        });
      }

      return res.status(201).json({
        message: "Le client a été créé avec succès!",
        client,
      });
    } catch (error) {
      console.error("createClient error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        detail: error.message || "Unknown error occurred",
      });
    }
  },

  createVendeur: async (req, res) => {
    const { phone, name, zone, address, created_by, solde_actuelle } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const sanitizedNom = name.replace(/\s+/g, "_");
    const safePassword = `${phone}#V!25`;
    const email = ` ${sanitizedNom}Vendeur${phone}@gmail.com`;
    const createdBy = created_by?.trim() || null;
    console.log('email:',email)
    const trimmedEmail = email.trim();

    try {
      const { data: registerData, error: registerError } =
        await supabase.auth.signUp({
          email:trimmedEmail,
          password: safePassword,
        });
      if (registerError || !registerData?.user) {
        throw new Error(registerError?.message || "SignUp failed");
      }
      const { user } = registerData;

      const { data: vendeurData, error: vendeurError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: trimmedEmail,
          phone,
          name,
          solde_actuelle: solde_actuelle ?? 0,
          address,
          created_by: createdBy,
        })
        .select()
        .single();
      if (vendeurError) {
        throw new Error(vendeurError.message);
      }

      const { data: roleData, error: roleError } = await supabase
        .from("role")
        .select("id")
        .eq("name", "Vendeur")
        .single();
      if (roleError || !roleData) {
        throw new Error(`Vendeur role not found: ${roleError?.message}`);
      }
      const vendeurRoleId = roleData.id;

      const { error: roleAssignError } = await supabase
        .from("user_role")
        .insert({
          id_user: vendeurData.id,
          id_role: vendeurRoleId,
        });
      if (roleAssignError) {
        throw new Error(
          "User role assignment failed: " + roleAssignError.message
        );
      }

      let zoneNom = "Zone inconnue";

      if (zone) {
        const { data: zoneData, error: zoneError } = await supabase
          .from("zones")
          .select("id, Nom")
          .eq("id", zone)
          .single();
        if (zoneError || !zoneData) {
          throw new Error(
            `Zone with ID ${zone} not found: ${zoneError?.message}`
          );
        }
        zoneNom = zoneData.Nom;

        const { error: assignError } = await supabase
          .from("zone_vendeur")
          .insert({
            id_vendeur: vendeurData.id,
            id_zone: zone,
          });
        if (assignError) {
          throw new Error(`
              Le vendeur a été créé, mais l'assignation à la zone a échoué: ${assignError.message}`);
        }
      }

      return res.status(201).json({
        message: "Le vendeur a été créé avec succès!",
        vendeur: vendeurData,
        zone: zoneNom,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        detail: error.message,
      });
    }
  },

  createUser: async (req, res) => {
    const { name,email, password, statut, phone, address, geoCode, infos, Qr_code, id_role } =
      req.body;

    if (!name || !phone || !address || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, phone, email, password and address are required!" });
    }

    try {
      const { data: registerData, error: registerError } =
      await supabase.auth.signUp({
        email,
        password
      });
    if (registerError || !registerData?.user) {
      throw new Error(registerError?.message || "SignUp failed");
    }
    const { user } = registerData;
      const { data, error } = await supabase
        .from("users")
        .insert([{id:user.id, name, statut, phone, address, geoCode, infos, Qr_code }])
        .select("*");

      if (error) {
        return res
          .status(400)
          .json({ error: "Database insert failed!", details: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(400).json({ error: "Failed to create user!" });
      }

      const newUserId = data[0].id;

      if (id_role && id_role.length > 0) {
        const newRoles = id_role.map((roleId) => ({
          id_user: newUserId,
          id_role: roleId,
        }));

        const { error: roleError } = await supabase
          .from("user_role")
          .insert(newRoles);

        if (roleError) {
          return res.status(400).json({
            error: "User role assignment failed",
            details: roleError.message,
          });
        }
      }

      return res
        .status(201)
        .json({ message: "User created successfully!", user: data[0] });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User ID is required!" });
    }
    // let id_role = req.body.id_role;
    const {id_role, ...updates} = req.body;
    try {
      const { data, error } = await supabase
        .from("users")
        .update({...updates})
        .eq("id", id)
        .select("*");

      if (error) {
        return res
          .status(400)
          .json({ error: "Database update failed!", details: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "User not found!" });
      }
console.log()
      if (id_role && id_role.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_role")
          .delete()
          .eq("id_user", id);

        if (deleteError) {
          return res.status(400).json({
            error: "Failed to remove previous roles",
            details: deleteError.message,
          });
        }

        const newRoles = id_role.map((roleId) => ({
          id_user: id,
          id_role: roleId,
        }));
        console.log("news:",newRoles)
        const { error: insertError } = await supabase
          .from("user_role")
          .insert(newRoles);

        if (insertError) {
          return res.status(400).json({
            error: "User role assignment failed",
            details: insertError.message,
          });
        }
      }

      return res
        .status(200)
        .json({ message: "User updated successfully!", user: data[0] });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  getZones: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }

    try {
      const { data, error } = await supabase
        .from("zone_vendeur")
        .select("zones(*)")
        .eq("id_vendeur", id);

      if (error) {
        return res.status(400).json({ error });
      }

      if (!data || data.length === 0) {
        return res.status(200).json([]);
      }

      const detail = data.map((z) => ({
        id_zone: z.zones.id,
        nom: z.zones.Nom,
      }));

      return res.status(200).json({
        id_vendeur: id,
        zones: detail,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  getStocks: async (req, res) => {
    const { id, type } = req.params;
    if (!id) {
      return res.status(400).json({ error: "id is required!" });
    }
    try {
      const stocks = await supabase
        .from("stock")
        .select("*")
        .eq("responsable", id)
        .eq("type", type);
      if (stocks.error) {
        return res.status(400).json({ error: stocks.error });
      }
      // Fetch stock details
      const detailsResponse = await supabase
        .from("stock_detail")
        .select("*, Produits(*), stock(*)")
        .eq("id_stock", stocks.data[0].id);

      if (detailsResponse.error) {
        return res.status(400).json({ error: detailsResponse.error.message });
      }

      // Map stock details
      const details = detailsResponse.data.map(
        ({ Produits, quantite, status, isDeleted }) => ({
          id: Produits.id,
          produit: Produits.nomProduit,
          quantite,
          status,
          isDeleted,
        })
      );
      console.log();
      return res.status(200).json({ stock: stocks.data, details });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  uploadQr: async (req, res) => {
    try {
      const id_client = req.body.id_client;
      console.log(id_client, req.file, "req:", req);

      if (!id_client || !req.file) {
        return res
          .status(400)
          .json({ error: "id_client and image file are required!" });
      }
      const { originalname, buffer, mimetype } = req.file;

      // Check if the client folder exists (optional)
      const { data: existingFiles, error: listError } = await supabase.storage
        .from("factures")
        .list(id_client);

      if (listError) {
        console.warn("Error listing files:", listError.message);
      }

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("factures")
        .upload(`${id_client}/${originalname}`, buffer, {
          contentType: mimetype,
          upsert: true, // Overwrites if file exists
        });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("factures")
        .getPublicUrl(`${id_client}/${originalname}`);
      const fileUrl = publicUrlData.publicUrl;
      const updateUser = await supabase
        .from("users")
        .update({ Qr_code: fileUrl })
        .eq("id", id_client);
      if (updateUser.error) {
        return res.status(400).json(updateUser.error);
      }
      return res
        .status(200)
        .json({ message: "File uploaded successfully", fileUrl });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  uploadFile: async (req, res) => {
    try {
      const { id_client, id_vente } = req.body;

      if (!id_client || !id_vente || !req.file) {
        return res
          .status(400)
          .json({ error: "id_client, id_vente, and image file are required!" });
      }

      const { originalname, buffer, mimetype } = req.file;

      // Check if the client folder exists (optional)
      const { error: listError } = await supabase.storage
        .from("factures")
        .list(id_client);
      if (listError) {
        console.warn("Error listing files:", listError.message);
        return res
          .status(500)
          .json({ error: "Failed to list existing files." });
      }

      // Upload the file to Supabase Storage
      const uploadResult = await supabase.storage
        .from("factures")
        .upload(`${id_client}/${originalname}`, buffer, {
          contentType: mimetype,
          upsert: true,
        });
      console.log("Upload result:", uploadResult);

      if (uploadResult.error) {
        return res.status(500).json({ error: uploadResult.error.message });
      }

      const uploadedPath = uploadResult.data?.path;
      console.log("Uploaded file path:", uploadedPath);

      if (!uploadedPath) {
        return res
          .status(500)
          .json({ error: "Upload failed, no file path returned." });
      }

      // Try getting the public URL
      const publicUrlResponse = supabase.storage
        .from("factures")
        .getPublicUrl(uploadedPath);
      console.log("Public URL Response:", publicUrlResponse);

      const publicUrl = publicUrlResponse.data.publicUrl;
      console.log("Generated Public URL:", publicUrl);

      // Update the ventes table with the file URL
      const { error: updateError } = await supabase
        .from("ventes")
        .update({ facture: publicUrl })
        .eq("id", id_vente);

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      return res
        .status(200)
        .json({ message: "File uploaded successfully", fileUrl: publicUrl });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  addImage: async (req, res) => {
    const file = req.file;
    const { id_vendeur } = req.body;

    if (!file) {
      return res.status(400).json({ error: "Image is required!" });
    }
    if (!id_vendeur) {
      return res.status(400).json({ error: "Vendor ID is required!" });
    }

    try {
      let { originalname, buffer, mimetype } = file;

      // 1. Normalize the file name (Remove special characters & spaces)
      const fileExtension = originalname.split(".").pop(); // Extract file extension
      const fileName = originalname
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9.\-_]/g, "") // Remove special characters
        .toLowerCase();

      const filePath = `${id_vendeur}/${fileName}`;

      // 2. Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from("vendeurs")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // 3. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("vendeurs")
        .getPublicUrl(filePath);

      // 4. Ensure URL is retrieved
      if (!publicUrlData || !publicUrlData.publicUrl) {
        return res.status(400).json({ error: "Failed to retrieve image URL" });
      }

      // 5. Update the user's image in the database
      const { error: dbError } = await supabase
        .from("users")
        .update({ image: publicUrlData.publicUrl })
        .eq("id", id_vendeur);

      if (dbError) {
        return res.status(400).json({ error: dbError.message });
      }

      return res
        .status(200)
        .json({
          message: "Image uploaded successfully",
          fileUrl: publicUrlData.publicUrl,
        });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
  getRoles: async(req,res)=>{
    try{
      const getAll= await supabase
      .from('role')
      .select('*')
      if(getAll.error){
        return res.status(400).json(getAll.error)
      }
      return res.status(200).json(getAll.data)
    }catch(error){
      return res.status(500).json(error)
    }
  },
  getUserID: async(req,res)=>{
    const {id}= req.params;
    if(!id){
      return res.status(400).json('id is required!')
    }
    try{
      const getUser = await supabase
      .from('users')
      .select('*')
      .eq('id',  id)
      if(getUser.error){
        return res.status(400).json(getUser.error)
      }
      return res.status(200).json(getUser.data)
    }catch(error){
      return res.status(500).json(error)
    }
  }
};
module.exports = users;
