import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user || !user.email) return false;

      // 🔥 Send user data to backend to create/register user & get JWT token
      const res = await fetch("http://localhost:8080/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, name: user.name }),
      });

      if (!res.ok) return false;

      const data = await res.json();

      // ✅ Store JWT token in token field for session
      user.id = data.token;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.id; // ✅ Store JWT token in session
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string; // ✅ Ensure token persists
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", // ✅ Redirect users to landing page if they manually navigate to sign in
  },
};

export default NextAuth(authOptions);
