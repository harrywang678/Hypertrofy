// lib/auth.ts
import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {connectDB} from "@/config/database";
import User from "@/models/user";
import type {Profile} from "next-auth";

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
      await connectDB();

      // ✅ Check if session.user and session.user.email are defined
      if (session?.user?.email) {
        const sessionUser = await User.findOne({email: session.user.email});
        if (sessionUser) {
          // ✅ Safely assign ID only if session.user exists
          (session.user as {id?: string}).id = sessionUser._id.toString();
        }
      }

      return session;
    },

    async signIn({
      profile,
    }: {
      user?: any;
      account?: any;
      profile?: Profile;
      email?: any;
      credentials?: any;
    }): Promise<boolean> {
      await connectDB();

      // Cast profile to ExtendedProfile if it exists
      const extProfile = profile as ExtendedProfile | undefined;

      if (!extProfile?.email) {
        return false;
      }

      const userExists = await User.findOne({email: extProfile.email});

      if (!userExists) {
        await User.create({
          email: extProfile.email,
          name: extProfile.name,
          image: extProfile.picture,
        });
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
