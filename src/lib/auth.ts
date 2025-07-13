// lib/auth.ts
import GoogleProvider from "next-auth/providers/google";
import {users} from "@/config/mongoCollections";
import CredentialsProvider from "next-auth/providers/credentials";
import {loginUser} from "@/data/users";
import {connectDB} from "@/config/database";
import type {JWT} from "next-auth/jwt";
import type {Session, User} from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_ID ??
        (() => {
          throw new Error("GOOGLE_ID is not set");
        })(),
      clientSecret:
        process.env.GOOGLE_SECRET ??
        (() => {
          throw new Error("GOOGLE_SECRET is not set");
        })(),
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

          if (result && result.user) {
            // result.user exists because loginUser returns {user: ...}
            return {
              id:
                typeof result.user._id === "string"
                  ? result.user._id
                  : result.user._id.toString(),
              email: result.user.email,
              name: result.user.name,
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
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user?: User;
    }) {
      session.user = token.user as {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };

      return session;
    },

    async jwt({token, user, session}: {token: JWT; user?: any; session?: any}) {
      if (user) token.user = user;
      return token;
    },

    async signIn({
      user,
      account,
      profile,
    }: {
      user: any;
      account: any;
      profile?: any;
    }) {
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
