// lib/auth.ts
import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {users} from "@/config/mongoCollections";
import CredentialsProvider from "next-auth/providers/credentials";
import Credentials from "next-auth/providers/credentials";
import {loginUser} from "@/data/users";
import {profileEnd} from "console";
import {connectDB} from "@/config/database";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await loginUser(
            credentials.email,
            credentials.password
          );
          console.log("Login result:", result);
          console.log("User from result:", result?.user);
          console.log("User ID:", result?.user?.id);

          if (result && result.user) {
            // result.user exists because loginUser returns {user: ...}
            return {
              id: result.user.id, // result.user.id exists and is a string
              email: result.user.email,
              name: result.user.name,
              image: result.user.image || null,
            };
          }

          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async session({session, token, user}) {
      // console.log("session callback", {token, user, session});
      session.user = token.user;
      return session;
    },

    async jwt({token, user, session}) {
      // console.log("jwt callback", {token, user, session});
      if (user) token.user = user;
      return token;
    },

    async signIn({user, account, profile}) {
      // console.log("signIn callback", {user, account, profile});

      // Handle Google OAuth sign-in
      if (account?.provider === "google" && profile?.email) {
        try {
          await connectDB();
          const usersCollection = await users();

          const userExists = await usersCollection.findOne({
            email: profile.email,
          });

          if (!userExists) {
            const now = new Date();
            await usersCollection.insertOne({
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              createdAt: now,
              updatedAt: now,
              friends: [],
            });
          }
        } catch (error) {
          console.error("Error handling Google sign-in:", error);
          return false;
        }
      }

      // Handle credentials sign-in
      if (account?.provider === "credentials") {
        // Credentials provider already validated the user in authorize()
        return true;
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
