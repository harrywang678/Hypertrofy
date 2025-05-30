// lib/auth.ts
import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {connectDB} from "@/config/database"; // Your MongoDB connection helper
import type {Profile} from "next-auth";
import {users} from "@/config/mongoCollections";

type ExtendedProfile = Profile & {picture?: string};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async session({session}) {
      if (!session?.user?.email) return session;

      const db = await connectDB();
      const user = await db
        .collection("users")
        .findOne({email: session.user.email});

      if (user) {
        (session.user as {id?: string}).id = user._id.toString();
      }

      return session;
    },

    async signIn({profile}) {
      if (!profile) return false;

      const extProfile = profile as ExtendedProfile;
      if (!extProfile.email) return false;

      const usersCollection = await users();

      const userExists = await usersCollection.findOne({
        email: extProfile.email,
      });

      if (!userExists) {
        const now = new Date();
        await usersCollection.insertOne({
          email: extProfile.email,
          name: extProfile.name,
          image: extProfile.picture,
          createdAt: now,
          updatedAt: now,
          friends: [],
        });
      }

      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
