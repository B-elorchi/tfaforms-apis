const { createClient } = require("@supabase/supabase-js");
const { supabase } = require("../config/supabase");
const jwt = require('jsonwebtoken');
const supabaseSecret = require("../config/supabase");

// Sign up user
const signUp = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { email, password, name, phone, address, geoCode, infos } = req.body;

    // Sign up the user with Supabase
    const response = await supabase.auth.signUp({ email, password });
    console.log("Supabase response:", response);

    // Handle the case where signUp is successful
    if (response.error) {
      return res.status(400).json({ error: response.error.message });
    }

    // Create a user in the database
    const { user } = response.data;
    const createUser = await supabase
      .from("users")
      .insert([
        {
          id: user.id,
          email: email,
          name: name,
          phone,
          address,
          geoCode,
          infos,
        },
      ])
      .select("*");
    if (createUser.error) {
      return res.status(400).json({ error: createUser.error.message });
    }

    // Respond with the created user data
    return res.status(200).json({
      message: "User created successfully",
      user: createUser.data[0],
    });
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Sign in user
// const signIn = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Sign in the user with Supabase
//         const response = await supabase.auth.signInWithPassword({
//             email,
//             password,
//         });
//         console.log('Supabase response:', response);

//         if (response.error) {
//             return res.status(400).json({ error: response.error.message });
//         }

//         // Fetch user from database
//         const fetchUser = await supabase
//             .from('users')
//             .select('*, role(*)')
//             .eq('id', response.data.user.id)
//             .single();

//         if (fetchUser.error) {
//             return res.status(400).json({ error: fetchUser.error });
//         }

//         if (!fetchUser.data) {
//             return res.status(404).json({ error: 'User not found in database' });
//         }

//         // Return the user data and access token
//         res.status(200).json({
//             user: fetchUser.data,
//             token: response.data.session.access_token,
//             token_expires_in: response.data.session.expires_in,
//         });

//     } catch (error) {
//         console.error('Error during sign-in:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase response:", response);

    if (response.error) {
      return res.status(400).json({ error: response.error.message });
    }

    const userEmail = response.data.user.email;

    const fetchUser = await supabase
      .from("users")
      .select("*")
      .eq("email", userEmail)
      // .single();
console.log('fetchUser:',fetchUser)
    if (fetchUser.error || !fetchUser.data) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const fetchRoles = await supabase
      .from("user_role")
      .select("role(name)")
      .eq("id_user", fetchUser.data[0].id);
console.log('fetchRoles:', fetchRoles)
    if (fetchRoles.error) {
      return res.status(400).json({ error: fetchRoles.error.message });
    }

    const roles = fetchRoles.data.map((r) => r.role.name);

    // Generate a custom JWT token (non-expiring)
    const payload = {
      userId: fetchUser.data[0].id,
      roles: roles,
      // Add other claims if needed
    };
    console.log("Secret Key:", supabaseSecret);
    // Generate the JWT token with no expiration
    const token = jwt.sign(payload, process.env.SUPABASE_KEY);  // No expiration provided, making it non-expiring

    res.status(200).json({
      user: {
        ...fetchUser.data,
        roles,
      },
      token,  // Return the custom JWT token
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Sign out user
const signOut = async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Signed out successfully" });
};

module.exports = {
  signUp,
  signIn,
  signOut,
};
