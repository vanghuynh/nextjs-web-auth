"use server";

import { redirect } from "next/navigation";
import { hashUserPassword, verifyPassword } from "../lib/hash";
import { createUser, getUserByEmail } from "../lib/user";
import { createAuthSession } from "../lib/auth";

export async function sigup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};
  if (!email.includes("@")) {
    errors.email = "Please enter a valid email";
  }

  if (password.trim().length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // store it in the database
  const hashedPassword = hashUserPassword(password);
  try {
    const id = createUser(email, hashedPassword);
    createAuthSession(id);
    redirect("/training");
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "User with that email already exists",
        },
      };
    }
    throw err;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);
  if (!existingUser) {
    return {
      errors: {
        email: "User with that email does not exist",
      },
    };
  }
  const isValidPassword = verifyPassword(existingUser.password, password);
  if (!isValidPassword) {
    return {
      errors: {
        password: "Password is not correct",
      },
    };
  }
  createAuthSession(existingUser.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return sigup(prevState, formData);
}
