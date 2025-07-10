
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../../server/utils/jwt');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  constructor(userAccessor, conversationState) {
    this.userAccessor = userAccessor;
    this.conversationState = conversationState;
  }

  async loginUser(context) {
    const message = context.activity.text;
    const match = message.match(/login(?: with)? ([^\s]+) ([^\s]+)/i);
  
    if (!match) {
      return await context.sendActivity(" Please use: `login your@email.com yourpassword`");
    }
  
    const [, email, password] = match;
  
    try {
      // Get user by email only
      const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  
      if (!user) {
        return await context.sendActivity("❌ Email not registered. Try signing up.");
      }
  
      //  Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return await context.sendActivity("❌ Incorrect password. Try again.");
      }
  
      //  Generate JWT
      const token = generateToken({ id: user.id, email: user.email });
  
      //  Save user to bot state with token
      await this.userAccessor.set(context, { ...user, token });
      await this.conversationState.saveChanges(context);
  
      await context.sendActivity(`✅ Login successful! Welcome back, *${user.name}*.\n Your token: ${token}`);
    } catch (error) {
      console.error(" Login error:", error);
      await context.sendActivity(" An error occurred during login.");
    }
  }
  async logoutUser(context) {
    await this.userAccessor.delete(context);
    await this.conversationState.saveChanges(context);
    await context.sendActivity(" You have been logged out.");
  }

  async signupUser(context) {
    const message = context.activity.text;
    const match = message.match(/signup ([^\s]+) ([^\s]+) ([^\s]+)/i);

    if (!match) {
      return await context.sendActivity(" Please use: `signup YourName your@email.com yourpassword`");
    }

    const [, name, email, password ] = match;

    try {
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return await context.sendActivity(" This email is already registered. Try logging in with `login email password`.");
      }
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const [result] = await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

      const user = { id: result.insertId, name, email };
      await this.userAccessor.set(context, user);
      await this.conversationState.saveChanges(context);
      await context.sendActivity(`🎉 Signup successful! Welcome, *${name}*! You're now logged in.`);
    } catch (error) {
      console.error("❌ Signup error:", error);
      await context.sendActivity(" An error occurred during signup.");
    }
  }
}

module.exports = AuthService;
