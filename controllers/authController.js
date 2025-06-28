import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// Signup Controller
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserSql, [email], async (err, data) => {
      if (err) return res.status(500).json({ message: "DB Error", error: err });

      if (data.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = "INSERT INTO users (name, email, password) VALUES (?)";
      const values = [name, email, hashedPassword];

      db.query(insertSql, [values], (err, result) => {
        if (err) return res.status(500).json({ message: "DB Error", error: err });
        return res.status(201).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
};

// Login Controller
export const login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, data) => {
    if (err) return res.status(500).json({ message: "DB Error", error: err });

    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = data[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
};

// Protected Route Example
export const protectedRoute = (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authenticated!` });
};
