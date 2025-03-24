const swaggerJSDoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "africaBis API Documentation",
			version: "1.0.0",
			description: "API Documentation for the application africaBis",
		},
		servers: [
			{
				url: "http://localhost:5005/", // Local development server URL
			},
			{
                                url: "https://api.africabis.ma/", // Local development server URL
                        },
			{
				url: "https://africabis-api.onrender.com/", 
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ["./src/routes/*.js"], // Path to the API routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
