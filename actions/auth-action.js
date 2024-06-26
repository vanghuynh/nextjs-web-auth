"use server";

import { redirect } from "next/navigation";
import { hashUserPassword } from "../lib/hash";
import { createUser } from "../lib/user";

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
    createUser(email, hashedPassword);
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
  redirect("/training");
}
