// api/controllers/userController.js
const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const knex = require("knex")(require("../../knexfile").development);
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  console.log("register function called");
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
  }

  try {
    const user = await knex("users").where({ email }).first();

    if (user) {
      return res.status(409).json({
        error: true,
        message: "User already exists",
      });
    }

    const newUser = await knex("users").insert({ email, password });

    res.status(201).json({
      message: "User created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};
exports.login = async (req, res) => {
  const {
    email,
    password,
    longExpiry,
    bearerExpiresInSeconds,
    refreshExpiresInSeconds,
  } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
  }

  try {
    const user = await knex("users").where({ email }).first();

    // Check if user exists and password is correct
    if (!user || password !== user.password) {
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password",
      });
    }

    // User authenticated successfully, generate JWTs

    const expiresIn = longExpiry ? "1y" : bearerExpiresInSeconds || 600;
    const refreshExpiresIn = longExpiry
      ? "1y"
      : refreshExpiresInSeconds || 86400;

    const bearerToken = jwt.sign({ id: user.id }, jwtSecret, { expiresIn });
    const refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, {
      expiresIn: refreshExpiresIn,
    });

    res.status(200).json({
      bearerToken: {
        token: bearerToken,
        token_type: "Bearer",
        expires_in: expiresIn,
      },
      refreshToken: {
        token: refreshToken,
        token_type: "Refresh",
        expires_in: refreshExpiresIn,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  // Check if refresh token is provided
  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required",
    });
  }

  try {
    // Verify the refresh token
    jwt.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
      if (err) {
        // Token verification failed (e.g., expired or invalid token)
        return res.status(401).json({
          error: true,
          message: "Unauthorized",
        });
      }

      // Refresh token is valid, generate new bearer token
      const bearerToken = jwt.sign({ id: decoded.id }, jwtSecret, {
        expiresIn: 600,
      });

      // Generate new refresh token
      const refreshToken = jwt.sign({ id: decoded.id }, refreshTokenSecret, {
        expiresIn: 86400,
      });

      res.status(200).json({
        bearerToken: {
          token: bearerToken,
          token_type: "Bearer",
          expires_in: 600,
        },
        refreshToken: {
          token: refreshToken,
          token_type: "Refresh",
          expires_in: 86400,
        },
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};
exports.logout = (req, res) => {
  const { refreshToken } = req.body;

  // Check if refresh token is provided
  if (!refreshToken) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, refresh token required",
    });
  }

  // You may want to implement additional logic here, such as invalidating the refresh token in your database or blacklist

  res.status(200).json({
    error: false,
    message: "Token successfully invalidated",
  });
};
exports.getProfile = (req, res) => {
  const { email } = req.params;
  const authorized = req.headers.authorization;

  // Check if the request is authorized with a JWT bearer token
  if (authorized && authorized.startsWith("Bearer ")) {
    // Extract the token from the Authorization header
    const token = authorized.substring(7);

    // You may want to verify and decode the token here to get the user's information
    // For simplicity, we'll assume the token is valid and decoded

    // Retrieve the user's profile information from your database
    knex("users")
      .where({ email })
      .first()
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: true,
            message: "User not found",
          });
        }

        const userProfile = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          dob: user.dob || null,
          address: user.address || null,
        };

        res.status(200).json(userProfile);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: true,
          message: "Internal server error",
        });
      });
  } else {
    // The request is not authorized, return unauthenticated profile
    // Retrieve the user's unauthenticated profile information from your database
    knex("users")
      .where({ email })
      .first()
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: true,
            message: "User not found",
          });
        }

        const unauthenticatedProfile = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };

        res.status(200).json(unauthenticatedProfile);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          error: true,
          message: "Internal server error",
        });
      });
  }
};
exports.updateProfile = async (req, res) => {
  const { email } = req.params;
  console.log(email);
  const authorized = req.headers.authorization;
  const { firstName, lastName, dob, address } = req.body;
  console.log("Authorization Header:", authorized);
  // Check if the request is authorized with a JWT bearer token
  if (authorized && authorized.startsWith("Bearer ")) {
    // Extract the token from the Authorization header
    const token = authorized.substring(7);

    // You may want to verify and decode the token here to get the user's information
    // For simplicity, we'll assume the token is valid and decoded
    try {
      // Verify the JWT token using the secret key
      jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user's ID from the token payload (assuming 'id' field is present)
      const { id } = jwt.decode(token);

      // Fetch the user from the database based on the ID
      const user = await knex("users").where({ id }).first();

      // Check if the user exists and the email matches the URL parameter
      if (!user || user.email !== email) {
        return res.status(404).json({
          error: true,
          message: "User not found",
        });
      }

      // Perform input validation
      if (!firstName || !lastName || !dob || !address) {
        return res.status(400).json({
          error: true,
          message:
            "Request body incomplete: firstName, lastName, dob, and address are required",
        });
      }

      if (
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof dob !== "string" ||
        typeof address !== "string"
      ) {
        return res.status(400).json({
          error: true,
          message:
            "Request body invalid: firstName, lastName, dob, and address must be strings only",
        });
      }

      // Validate the date of birth format (YYYY-MM-DD)
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dob.match(dobRegex)) {
        return res.status(400).json({
          error: true,
          message:
            "Invalid input: dob must be a real date in format YYYY-MM-DD",
        });
      }

      // Update the user's profile information in the database
      // Replace this code with your own database update logic
      await knex("users").where({ id }).update({
        firstName,
        lastName,
        dob,
        address,
      });

      // Return the updated profile information
      const updatedProfile = {
        email,
        firstName,
        lastName,
        dob,
        address,
      };

      return res.status(200).json(updatedProfile);
    } catch (error) {
      // The token is invalid or has expired
      return res.status(401).json({
        error: true,
        message: "Invalid or expired JWT token",
      });
    }
  }

  // The request is not authorized, return an error response
  res.status(401).json({
    error: true,
    message: 'Authorization header ("Bearer token") not found',
  });
};
