import { signToken } from '../services/jwtService.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// In-memory demo user store (bridges to Supabase PostgreSQL in production)
const MOCK_USERS = new Map([
  [
    'demo@mindmitra.ai',
    {
      email: 'demo@mindmitra.ai',
      password: 'Password123!',
      name: 'Alex Mercer'
    }
  ]
]);

export function handleLogin(reqBody) {
  const { email, password } = reqBody || {};

  if (!email || !password) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Email and password are required.'
      }
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = MOCK_USERS.get(normalizedEmail);

  if (!user) {
    // Convenient onboarding for demonstration
    user = {
      email: normalizedEmail,
      password: password,
      name: normalizedEmail.split('@')[0].replace(/^\w/, c => c.toUpperCase())
    };
    MOCK_USERS.set(normalizedEmail, user);
  } else if (user.password !== password) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Invalid email or password. Please try again.'
      }
    };
  }

  const token = signToken({
    email: user.email,
    name: user.name
  });

  return {
    status: 200,
    body: {
      success: true,
      message: 'Login successful. Welcome back to MindMitra!',
      token,
      user: {
        email: user.email,
        name: user.name
      }
    }
  };
}

export function handleRegister(reqBody) {
  const { name, email, password } = reqBody || {};

  if (!name || !email || !password) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Name, email, and password are required.'
      }
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (MOCK_USERS.has(normalizedEmail)) {
    return {
      status: 409,
      body: {
        success: false,
        message: 'An account with this email already exists.'
      }
    };
  }

  const newUser = {
    name: name.trim(),
    email: normalizedEmail,
    password: password
  };

  MOCK_USERS.set(normalizedEmail, newUser);

  const token = signToken({
    email: newUser.email,
    name: newUser.name
  });

  return {
    status: 201,
    body: {
      success: true,
      message: 'Account created successfully! Welcome to MindMitra.',
      token,
      user: {
        email: newUser.email,
        name: newUser.name
      }
    }
  };
}
