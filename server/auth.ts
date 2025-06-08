import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { storage } from './storage';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'password'>;
  token?: string;
  message?: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
      return null;
    }
  }

  static generateEmailConfirmationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async sendConfirmationEmail(email: string, token: string, username: string): Promise<void> {
    console.log(`Email confirmation would be sent to: ${email}`);
    console.log(`Confirmation link: ${BASE_URL}/api/auth/confirm-email?token=${token}`);
    console.log(`Username: ${username}`);
    
    // For development/testing, automatically confirm the email after a short delay
    // In production, this would be replaced with actual email sending
    setTimeout(async () => {
      try {
        console.log('Auto-confirming email for testing purposes...');
        await AuthService.confirmEmail(token);
      } catch (error) {
        console.error('Auto-confirm error:', error);
      }
    }, 2000); // Auto-confirm after 2 seconds for testing
  }

  static async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return { success: false, message: 'Email already registered' };
      }

      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return { success: false, message: 'Username already taken' };
      }

      // Hash password and generate confirmation token
      const hashedPassword = await this.hashPassword(password);
      const confirmationToken = this.generateEmailConfirmationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });
      console.log('created user', user, 'confirmation token', confirmationToken, 'token expiry', tokenExpiry, 'email', email, 'username', username, 'password', password, 'hashed password', hashedPassword)

      // Update user with confirmation token
      await storage.updateUser(user.id, {
        isEmailConfirmed: false,
        emailConfirmationToken: confirmationToken,
        emailConfirmationTokenExpiry: tokenExpiry,
      });

      // Send confirmation email
      await this.sendConfirmationEmail(email, confirmationToken, username);

      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'Registration successful! Please check your email to confirm your account.',
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid email or password' };
      }

      if (!user.isEmailConfirmed) {
        return { success: false, message: 'Please confirm your email address before logging in' };
      }

      const token = this.generateToken(user.id);
      const { password: _, ...userWithoutPassword } = user;
      return {
        success: true,
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  static async confirmEmail(token: string): Promise<AuthResponse> {
    try {
      // Find user by confirmation token
      const user = await storage.getUserByConfirmationToken(token);
      
      if (!user) {
        return { success: false, message: 'Invalid confirmation token' };
      }

      // Check if token is expired
      if (user.emailConfirmationTokenExpiry && user.emailConfirmationTokenExpiry < new Date()) {
        return { success: false, message: 'Confirmation token has expired' };
      }

      // Update user to confirmed
      const updatedUser = await storage.updateUser(user.id, {
        isEmailConfirmed: true,
        emailConfirmationToken: null,
        emailConfirmationTokenExpiry: null,
      });

      const userWithoutPassword = updatedUser ? (() => {
        const { password: _, ...rest } = updatedUser;
        return rest;
      })() : undefined;

      return {
        success: true,
        message: 'Email confirmed successfully! You can now log in.',
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Email confirmation error:', error);
      return { success: false, message: 'Email confirmation failed' };
    }
  }
}