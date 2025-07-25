// lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback - token:', token)
      console.log('JWT Callback - user:', user)
      
      if (user) {
        token.id = user.id
        console.log('Setting token.id to:', user.id)
      }
      
      if (!token.id && token.sub) {
        token.id = token.sub
        console.log('Using token.sub as id:', token.sub)
      }
      
      console.log('JWT Callback - final token:', token)
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback - session:', session)
      console.log('Session Callback - token:', token)
      
      if (token) {
        session.user.id = (token.id || token.sub) as string
        console.log('Setting session.user.id to:', (token.id || token.sub))
      }
      
      console.log('Session Callback - final session:', session)
      return session
    }
  }
}
