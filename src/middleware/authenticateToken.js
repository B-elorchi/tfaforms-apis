const { supabase, supabaseSecret } = require("../config/supabase");
const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
    console.log("authenticateToken middleware called");
	const authHeader = req.headers.authorization; // Check if the authorization header exists
	console.log("Auth Header: " + authHeader);

	const token = authHeader && authHeader.split(" ")[1]; // Ensure token is in "Bearer <token>" format
	console.log("Token: " + token);

	if (!token) {
		return res.status(401).json({ error: "Unauthorized. Token missing." });
	}

	try {
		// Verify the token using the JWT secret key
		const decodedToken = jwt.verify(token, process.env.SUPABASE_KEY);
		console.log("Decoded Token: ", decodedToken);

		req.user = decodedToken; // Attach the decoded token (user data) to the request object
		next(); // Pass control to the next middleware/route handler
	} catch (error) {
		console.error("Error during token verification:", error);
		return res
			.status(401)
			.json({ error: "Invalid token. Unauthorized access." });
	}

console.log("User attached to request:", req.user);
};