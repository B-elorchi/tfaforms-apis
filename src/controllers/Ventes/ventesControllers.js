const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { supabase } = require("../../config/supabase");
const moment = require("moment");
require("dotenv").config();
const bucket_url = "https://dbrel.africabis.ma/storage/v1/object/public";
const Controllers = {
  createVente: async (req, res) => {
    console.log("Received req.body:", req.body); // Debugging log

    const {
      id_client,
      id_vendeur,
      totalCommande,
      montantEncaisse,
      id_indice,
      produits,
      created_at,
    } = req.body;

    // Validation
    if (
      !id_client ||
      !id_vendeur ||
      totalCommande === undefined ||
      montantEncaisse === undefined ||
      !id_indice ||
      !Array.isArray(produits) ||
      produits.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Fetch vendeur stock BEFORE creating the vente
      const getStock = await supabase
        .from("stock")
        .select("id")
        .eq("type", "Vehicule")
        .eq("responsable", id_vendeur);

      if (getStock.error) {
        return res.status(400).json({ error: getStock.error.message });
      }

      if (!getStock.data || getStock.data.length === 0) {
        return res.status(404).json({ error: "Vendeur has no stock" });
      }

      const id_stock = getStock.data[0].id;
      // get zone
      const getZone = await supabase
        .from("zone_vendeur")
        .select("id_zone")
        .eq("id_vendeur", id_vendeur);
      if (getZone.error) {
        return res.status(400).json({ error: getZone.error });
      }
      if (getZone.data.length === 0) {
        return res
          .status(404)
          .json({ error: "vendeur is not assigned to any zone!" });
      }
      const id_zone = getZone.data[0].id_zone;
      // Insert vente (after verifying stock exists)
      const { data: venteData, error: venteError } = await supabase
        .from("ventes")
        .insert({
          id_client,
          id_vendeur,
          id_zone,
          id_indice,
          total_commande: totalCommande,
          montant_encaisse: montantEncaisse,
          created_at: created_at ? created_at : new Date(),
        })
        .select("*")
        .single();

      if (venteError) {
        throw new Error(venteError.message);
      }

      // Ensure all product quantities are numbers
      const parsedProduits = produits.map((p) => ({
        id_produit: p.id_produit,
        quantite: Number(p.quantite), // Ensure quantite is a number
      }));

      // Insert product details
      const addDetails = await Promise.all(
        parsedProduits.map(async (p) => {
          const { data, error } = await supabase
            .from("ventes_detail")
            .insert({
              id_vente: venteData.id,
              id_produit: p.id_produit,
              quantite: p.quantite,
            })
            .select("*")
            .single();

          if (error) {
            throw new Error(error.message);
          }

          return data;
        })
      );

      venteData.details = addDetails;

      // Process stock updates
      for (const { id_produit, quantite } of parsedProduits) {
        // if (isNaN(quantite) || quantite <= 0) {
        //   return res
        //     .status(400)
        //     .json({ error: `Invalid quantity for product ${id_produit}` });
        // }

        // Fetch stock details for this product
        const { data: stockData, error: stockError } = await supabase
          .from("stock_detail")
          .select("id, quantite")
          .eq("id_stock", id_stock)
          .eq("id_produit", id_produit);

        if (stockError) {
          return res.status(400).json({ error: stockError.message });
        }

        let newQuantity;
        if (stockData.length > 0) {
          // If stock exists, update quantity
          const currentQuantity = stockData[0].quantite;
          newQuantity = currentQuantity - quantite;

          const { error: updateStockError } = await supabase
            .from("stock_detail")
            .update({ quantite: newQuantity, last_modified: new Date() })
            .eq("id_stock", id_stock)
            .eq("id_produit", id_produit);

          if (updateStockError) {
            return res.status(400).json({
              error: `Failed to update stock for product ${id_produit}`,
            });
          }
        } else {
          // If stock does not exist, create a new row with the negative quantity
          newQuantity = -quantite;

          const { error: insertStockError } = await supabase
            .from("stock_detail")
            .insert({
              id_stock,
              id_produit,
              quantite: newQuantity,
              last_modified: new Date(),
            });

          if (insertStockError) {
            return res.status(400).json({
              error: `Failed to insert new stock for product ${id_produit}`,
            });
          }
        }
      }

      return res
        .status(201)
        .json({ message: "Vente created successfully", data: venteData });
    } catch (error) {
      console.error("Error creating vente:", error);
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  },
  // getAllVent: async (req, res) => {
    getAllVent: async (req, res) => {
      try {
        const { data: ventes, error: ventesError } = await supabase
          .from("ventes")
          .select("*");
    
        if (ventesError) throw new Error(ventesError.message);
        if (!ventes || ventes.length === 0) return res.json([]);
    
        const ventesWithDetails = await Promise.all(
          ventes.map(async (vente) => {
            const { data: details, error: detailsError } = await supabase
              .from("ventes_detail")
              .select("*")
              .eq("id_vente", vente.id);
    
            if (detailsError) {
              console.error("Error fetching vente details:", detailsError);
              return { ...vente, details: [] };
            }
            return { ...vente, details };
          })
        );
    
        res.json(ventesWithDetails);
      } catch (error) {
        console.error("Error fetching ventes:", error);
        res.status(500).json({ error: error.message });
      }
    },
  getOneVente: async (req, res) => {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID is required!" });
    }

    try {
      // Fetch Vente
      const { data: vente, error: venteError } = await supabase
        .from("ventes")
        .select("*")
        .eq("id", id);
      // Ensure we get a single object, not an array

      if (venteError) {
        return res.status(400).json({ error: venteError.message });
      }

      if (!vente) {
        return res.status(404).json({ error: "Vente not found!" });
      }

      // Fetch Vente Details
      const { data: details, error: detailsError } = await supabase
        .from("ventes_detail")
        .select("*")
        .eq("id_vente", id);

      if (detailsError) {
        console.error("Error fetching vente details:", detailsError);
        return res.status(500).json({ error: "Error fetching vente details" });
      }

      // Return final JSON
      return res.status(200).json({ ...vente, details });
    } catch (error) {
      console.error("Error fetching vente:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  //   generatePdf: async (req, res) => {
  //     try {
  //       const {
  //         produits,
  //         id_vente,
  //       } = req.body;
  //       if (
  //         !produits ||
  //         produits.length === 0 ||
  //         !id_vente
  //       ) {
  //         return res.status(400).json({ error: "Missing required fields" });
  //       }
  //       const getVente = await supabase
  //       .from('ventes')
  //       .select('*, client:users!ventes_id_client_fkey(id, name), vendeur:users!ventes_id_vendeur_fkey(id, name), zones(Nom)')
  //       .eq('id', id_vente);
  //       if(getVente.error){
  //         return res.status(400).json({error: getVente.error})
  //       }
  //       if(getVente.data.length === 0){
  //         return res.status(404).json({error: 'vente not found!'})
  //       }
  //       console.log('vente:', getVente.data)
  //       const clientName = getVente.data[0].client.name;
  //       const vendeurName = getVente.data[0].vendeur.name;
  //       const zoneName = getVente.data[0].zones.Nom;
  //       const VenteDate = getVente.data[0].created_at;
  //       const totalCommande = getVente.data[0].total_commande;
  //       const encaisse = getVente.data[0].montant_encaisse;
  //       const idClient = getVente.data[0].id_client;
  //       const totalQuantite = produits.reduce((acc, p) => acc + p.Quantité, 0);
  //       const resteAPayer = totalCommande - encaisse;

  //   // Définition du chemin du dossier client
  // const clientFolderPath = path.join(__dirname, `../../factures/${idClient}`);

  // // Vérifier si le dossier client existe, sinon le créer
  // if (!fs.existsSync(clientFolderPath)) {
  //   fs.mkdirSync(clientFolderPath, { recursive: true });
  // }

  // // Lire les fichiers existants dans le dossier client pour incrémenter le numéro de facture
  // let existingFiles = [];
  // try {
  //   existingFiles = fs.readdirSync(clientFolderPath);
  // } catch (err) {
  //   console.error("Erreur lors de la lecture du dossier client:", err);
  //   return res.status(500).json({ error: "Erreur serveur lors de la gestion des fichiers." });
  // }

  // // Calcul du numéro de facture en fonction des fichiers existants
  // const invoiceNumber = existingFiles.length + 1;

  // // Génération du nom du fichier
  // const fileName = `Facture_${moment(VenteDate).format("YYYY-MM-DD")}_${clientName
  //   .substring(0, 3)
  //   .toUpperCase()}_${vendeurName
  //     .substring(0, 3)
  //     .toUpperCase()}_${invoiceNumber}.pdf`;

  // // Chemin complet du fichier PDF à générer
  // const filePath = path.join(clientFolderPath, fileName);
  //       // Create PDF
  //       const doc = new PDFDocument({ margin: 30 });
  //       const writeStream = fs.createWriteStream(filePath);
  //       doc.pipe(writeStream);

  //       // **Replace "Africabis" with a Logo**
  //       const logoPath = path.join(__dirname, "../../utils/africabis.png"); // Adjust path if needed
  //       const logoWidth = 170; // Logo size
  //       const logoHeight = 190;
  //       doc.image(logoPath, 50, 30, { width: logoWidth, height: logoHeight }); // Draw the image at (X: 50, Y: 30)
  //       doc.moveDown(6);
  //       // **Header**
  //       // doc.fillColor("#E63946").fontSize(24).text("Africabis", { align: "left" }).moveDown()
  //       doc
  //         .fillColor("black")
  //         .fontSize(12)
  //         .font("Helvetica-Bold")
  //         .text(
  //           `livraison client: ${zoneName.substring(0, 3).toUpperCase()}_${moment(VenteDate).format("YYYY-MM-DD")}_${clientName.substring(0, 3).toUpperCase()}_${vendeurName.substring(0, 3).toUpperCase()}`,
  //           { align: "right" }
  //         )
  //         .text(`Client: ${clientName}`, { align: "right" })
  //         .text(`Vendeur: ${vendeurName}`, { align: "right" })
  //         .text(`Date échéance: ${moment(VenteDate).format("YYYY-MM-DD / HH : mm")}`, { align: "right" })
  //         .moveDown(2);

  //       // **Table Header**
  //       const startX = 20;
  //       let startY = doc.y;
  //       const rowHeight = 25; // **Fixed row height to prevent misalignment**

  //       doc
  //         .fillColor("white")
  //         .rect(startX, startY, 580, rowHeight)
  //         .fill("#1D3557")
  //         .stroke()
  //         .fillColor("white")
  //         .fontSize(10);

  //       doc.text("#", startX + 5, startY + 8, { width: 30, align: "center" });
  //       doc.text("Référence", startX + 40, startY + 8, {
  //         width: 80,
  //         align: "center",
  //       });
  //       doc.text("Libellé", startX + 130, startY + 8, {
  //         width: 150,
  //         align: "center",
  //       });
  //       doc.text("COLISAGE", startX + 290, startY + 8, {
  //         width: 60,
  //         align: "center",
  //       });
  //       doc.text("Qté Pack", startX + 350, startY + 8, {
  //         width: 60,
  //         align: "center",
  //       });
  //       doc.text("PU Pack", startX + 410, startY + 8, {
  //         width: 80,
  //         align: "center",
  //       });
  //       doc.text("Valeur Pack", startX + 490, startY + 8, {
  //         width: 80,
  //         align: "center",
  //       });

  //       doc.fillColor("black"); // Reset text color
  //       startY += rowHeight; // Move Y position down

  //       // **Table Rows with Fixed Heights**
  //       produits.forEach((p, index) => {
  //         // Alternate row background color
  //         if (index % 2 === 0) {
  //           doc.rect(startX, startY, 580, rowHeight).fill("#F1FAEE").stroke();
  //         }

  //         doc.fillColor("black").fontSize(10);
  //         doc.text(index + 1, startX + 5, startY + 8, {
  //           width: 30,
  //           align: "center",
  //         });
  //         doc.text(p.reference, startX + 40, startY + 8, {
  //           width: 80,
  //           align: "center",
  //         });
  //         doc.text(p.produit, startX + 130, startY + 8, {
  //           width: 150,
  //           align: "center",
  //         });
  //         doc.text(p.colisage, startX + 290, startY + 8, {
  //           width: 60,
  //           align: "center",
  //         });
  //         doc.text(p.Quantité, startX + 350, startY + 8, {
  //           width: 60,
  //           align: "center",
  //         });
  //         doc.text(`${p.prix_collisage.toFixed(2)} MAD`, startX + 410, startY + 8, {
  //           width: 80,
  //           align: "center",
  //         });
  //         doc.text(`${p.Total.toFixed(2)} MAD`, startX + 490, startY + 8, {
  //           width: 80,
  //           align: "center",
  //         });

  //         startY += rowHeight; // **Move Y position after completing the row**
  //       });

  //       doc.moveDown(2);

  //       // **Fix Summary Section Alignment with Absolute Positioning**
  //       const summaryStartY = doc.y + 20; // Fixed starting Y position
  //       const labelX = 400; // X position for labels
  //       const valueX = 520; // X position for values
  //       const lineHeight = 20; // Fixed spacing for each line
  //       doc.fillColor("black").fontSize(10).font("Helvetica-Bold");
  //       // **Draw Each Line at Fixed Positions**
  //       doc.text("Solde client:", 50, summaryStartY, {
  //         width: 120,
  //         align: "left",
  //       });
  //       doc.text(`${totalCommande.toFixed(2)} MAD`, 120, summaryStartY, {
  //         width: 80,
  //         align: "left",
  //       });
  //       doc.text("Total quantité:", labelX, summaryStartY + lineHeight, {
  //         width: 120,
  //         align: "right",
  //       });
  //       doc.text(`${totalQuantite}`, valueX, summaryStartY + lineHeight, {
  //         width: 80,
  //         align: "right",
  //       });
  //       doc.text("Total commande:", labelX, summaryStartY + 2 * lineHeight, {
  //         width: 120,
  //         align: "right",
  //       });
  //       doc.text(
  //         `${totalCommande.toFixed(2)} MAD`,
  //         valueX,
  //         summaryStartY + 2 * lineHeight,
  //         { width: 80, align: "right" }
  //       );
  //       doc.text("Encaissé:", labelX, summaryStartY + 3 * lineHeight, {
  //         width: 120,
  //         align: "right",
  //       });
  //       doc.text(
  //         `${encaisse.toFixed(2)} MAD`,
  //         valueX,
  //         summaryStartY + 3 * lineHeight,
  //         { width: 80, align: "right" }
  //       );
  //       doc.text("Reste à payer:", labelX, summaryStartY + 4 * lineHeight, {
  //         width: 120,
  //         align: "right",
  //       });
  //       doc.text(
  //         `${resteAPayer.toFixed(2)} MAD`,
  //         valueX,
  //         summaryStartY + 4 * lineHeight,
  //         { width: 80, align: "right" }
  //       );
  //       doc.fillColor("black"); // Reset color

  //       // Finalize the document
  //       doc.end();

  //       writeStream.on("finish", async () => {
  //         console.log('file:', filePath);
  //         const fileBuffer = fs.readFileSync(filePath); // Lit le fichier et retourne un Buffer

  //         if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
  //           console.error("Invalid file buffer:", fileBuffer);
  //           return res.status(500).json({ error: "Failed to read PDF file" });
  //         }

  //         // Upload to Supabase
  //         const { data, error } = await supabase.storage
  //           .from("factures")
  //           .upload(`${idClient}/${fileName}`, fileBuffer, {
  //             contentType: "application/pdf",
  //             upsert: true,
  //           });

  //         if (error) {
  //           console.error("Error uploading PDF:", error);
  //           return res
  //             .status(500)
  //             .json({ error: "Error uploading PDF", details: error });
  //         }

  //         const pdfUrl = `https://${process.env.bucket_url}/factures/${idClient}/${fileName}`;

  //         await supabase
  //           .from("ventes")
  //           .update({ facture: pdfUrl })
  //           .eq("id", id_vente);

  //         // Delete local file after upload
  //         fs.unlinkSync(filePath);

  //         return res.status(201).json({ message: "Facture créée", pdfUrl });
  //       });
  //     } catch (error) {
  //       console.error("Error generating PDF:", error);
  //       return res.status(500).json({ error: "Internal Server Error" });
  //     }
  //   },
  generatePdf: async (req, res) => {
    try {
      const { produits, id_vente } = req.body;

      // Validate required fields
      if (!produits || produits.length === 0 || !id_vente) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Fetch sale details from Supabase
      const getVente = await supabase
        .from("ventes")
        .select(
          "*, client:users!ventes_id_client_fkey(id, name, solde_actuelle), vendeur:users!ventes_id_vendeur_fkey(id, name), zones(Nom)"
        )
        .eq("id", id_vente);

      if (getVente.error) {
        return res.status(400).json({ error: getVente.error });
      }

      if (getVente.data.length === 0) {
        return res.status(404).json({ error: "Vente not found!" });
      }

      const vente = getVente.data[0];
      const clientName = vente.client.name;
      const soldeClient = vente.client.solde_actuelle;
      const vendeurName = vente.vendeur.name;
      const zoneName = vente.zones.Nom;
      const venteDate = vente.created_at;
      const totalCommande = vente.total_commande;
      const encaisse = vente.montant_encaisse;
      const idClient = vente.id_client;
      const totalQuantite = produits.reduce((acc, p) => acc + p.quantite, 0);
      const resteAPayer = totalCommande - encaisse;

      // Define client folder path
      const clientFolderPath = path.join(
        __dirname,
        `../../factures/${idClient}`
      );
      const baseFileName = `Bon_${moment(venteDate).format(
        "YYYY-MM-DD"
      )}_${clientName.substring(0, 3).toUpperCase()}_${vendeurName
        .substring(0, 3)
        .toUpperCase()}`;

      // List files in Supabase Storage
      const { data: existing, error: listError } = await supabase.storage
        .from("factures")
        .list(idClient);

      if (listError) {
        console.error("Error listing files:", listError);
        return res.status(500).json({ error: "Failed to list files" });
      }

      if (existing && existing.length > 0) {
        // Folder exists, get all files
        existingFiles = existing.map((file) => file.name);
      } else {
        // Folder does not exist, we can create it implicitly by uploading a file
        console.log(
          `Folder for client ${idClient} does not exist. It will be created upon upload.`
        );
      }
      // Find existing files that match the base filename
      let maxNumber = 0;
      existing.forEach((file) => {
        const match = file.name.match(
          new RegExp(`^${baseFileName}_(\\d+)\\.pdf$`)
        );
        if (match) {
          const fileNumber = parseInt(match[1], 10);
          if (!isNaN(fileNumber)) {
            maxNumber = Math.max(maxNumber, fileNumber);
          }
        }
      });

      // Increment file number
      const invoiceNumber = maxNumber + 1;
      const fileName = `${baseFileName}_${invoiceNumber}.pdf`;
      const filePath = path.join(clientFolderPath, fileName);

      // Generate PDF
      const pdfBuffer = await generatePdfDocument({
        produits,
        clientName,
        vendeurName,
        zoneName,
        venteDate,
        totalCommande,
        encaisse,
        totalQuantite,
        resteAPayer,
        soldeClient,
      });

      // console.log('PDF buffer:', pdfBuffer);
      try {
        const { data, error } = await supabase.storage
          .from("factures")
          .upload(`${idClient}/${fileName}`, pdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (error) throw error;
      } catch (err) {
        console.error("Error uploading PDF:", err);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res
          .status(500)
          .json({ error: "Error uploading PDF", details: err });
      }

      // Construct PDF URL
      const pdfUrl = `${bucket_url}/factures/${idClient}/${fileName}`;

      // Update sale record with PDF URL
      await supabase
        .from("ventes")
        .update({ facture: pdfUrl })
        .eq("id", id_vente);

      // Delete local file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn("Skipping file deletion, file not found:", filePath);
      }

      return res
        .status(201)
        .json({ message: "Facture créée", pdfUrl, baseFileName });
    } catch (error) {
      console.error("Error generating PDF:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error });
    }
  },
};

// Helper function to generate PDF document
const generatePdfDocument = async ({
  produits,
  clientName,
  vendeurName,
  zoneName,
  venteDate,
  totalCommande,
  encaisse,
  totalQuantite,
  resteAPayer,
  soldeClient,
}) => {
  const newTab = [];
  produits.map((p) => {
    if (p.quantite > 0) {
      newTab.push(p);
    }
  });
  console.log("newTab:", newTab);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // Add logo
    const logoPath = path.join(__dirname, "../../utils/africabis.png");
    doc.image(logoPath, 50, 30, { width: 170, height: 190 });
    doc.moveDown(6);

    // Add header
    doc
      .fillColor("black")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        `livraison client: ${zoneName.substring(0, 3).toUpperCase()}_${moment(
          venteDate
        ).format("YYYY-MM-DD")}_${clientName
          .substring(0, 3)
          .toUpperCase()}_${vendeurName.substring(0, 3).toUpperCase()}`,
        { align: "right" }
      )
      .text(`Client: ${clientName}`, { align: "right" })
      .text(`Vendeur: ${vendeurName}`, { align: "right" })
      .text(
        `Date échéance: ${moment(venteDate).format("YYYY-MM-DD / HH : mm")}`,
        { align: "right" }
      )
      .moveDown(2);

    // Add table
    const startX = 20;
    let startY = doc.y;
    const rowHeight = 25;

    // Table header
    doc
      .fillColor("white")
      .rect(startX, startY, 580, rowHeight)
      .fill("#1D3557")
      .stroke()
      .fillColor("white")
      .fontSize(10);

    doc.text("#", startX + 5, startY + 8, { width: 30, align: "center" });
    doc.text("Référence", startX + 40, startY + 8, {
      width: 80,
      align: "center",
    });
    doc.text("Libellé", startX + 130, startY + 8, {
      width: 150,
      align: "center",
    });
    doc.text("COLISAGE", startX + 290, startY + 8, {
      width: 60,
      align: "center",
    });
    doc.text("Qté Pack", startX + 350, startY + 8, {
      width: 60,
      align: "center",
    });
    doc.text("PU Pack", startX + 410, startY + 8, {
      width: 80,
      align: "center",
    });
    doc.text("Valeur Pack", startX + 490, startY + 8, {
      width: 80,
      align: "center",
    });

    doc.fillColor("black");
    startY += rowHeight;

    // Table rows
    newTab.forEach((p, index) => {
      // if (index % 2 === 0) {
      doc.rect(startX, startY, 580, rowHeight).stroke();
      // }

      doc.text(index + 1, startX + 5, startY + 8, {
        width: 30,
        align: "center",
      });
      doc.text(p.reference, startX + 40, startY + 8, {
        width: 80,
        align: "center",
      });
      doc.text(p.produit, startX + 130, startY + 8, {
        width: 150,
        align: "center",
      });
      doc.text(p.colisage, startX + 290, startY + 8, {
        width: 60,
        align: "center",
      });
      doc.text(p.quantite, startX + 350, startY + 8, {
        width: 60,
        align: "center",
      });
      doc.text(`${p.prix_collisage.toFixed(2)} MAD`, startX + 410, startY + 8, {
        width: 80,
        align: "center",
      });
      doc.text(`${p.Total.toFixed(2)} MAD`, startX + 490, startY + 8, {
        width: 80,
        align: "center",
      });

      startY += rowHeight;
    });

    // Add summary
    const summaryStartY = doc.y + 20;
    const labelX = 400;
    const valueX = 520;
    const lineHeight = 20;

    doc.text("Solde client:", 50, summaryStartY, { width: 120, align: "left" });
    doc.text(`${soldeClient.toFixed(2)} MAD`, 120, summaryStartY, {
      width: 80,
      align: "left",
    });
    doc.text("Total quantité:", labelX, summaryStartY + lineHeight, {
      width: 120,
      align: "right",
    });
    doc.text(`${totalQuantite}`, valueX, summaryStartY + lineHeight, {
      width: 80,
      align: "right",
    });
    doc.text("Total commande:", labelX, summaryStartY + 2 * lineHeight, {
      width: 120,
      align: "right",
    });
    doc.text(
      `${totalCommande.toFixed(2)} MAD`,
      valueX,
      summaryStartY + 2 * lineHeight,
      { width: 80, align: "right" }
    );
    doc.text("Encaissé:", labelX, summaryStartY + 3 * lineHeight, {
      width: 120,
      align: "right",
    });
    doc.text(
      `${encaisse.toFixed(2)} MAD`,
      valueX,
      summaryStartY + 3 * lineHeight,
      { width: 80, align: "right" }
    );
    doc.text("Reste à payer:", labelX, summaryStartY + 4 * lineHeight, {
      width: 120,
      align: "right",
    });
    doc.text(
      `${resteAPayer.toFixed(2)} MAD`,
      valueX,
      summaryStartY + 4 * lineHeight,
      { width: 80, align: "right" }
    );

    doc.end();
  });
};
module.exports = Controllers;
