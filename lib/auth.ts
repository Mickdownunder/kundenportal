import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Kundenzugang',
      credentials: {
        accessCode: { label: "Access Code", type: "text" },
      },
      async authorize(credentials: any) {
        if (!credentials?.accessCode) return null;
        const project = await prisma.project.findUnique({
          where: { accessCode: credentials.accessCode },
          include: { user: true },
        });
        if (project?.user) {
          return { ...project.user, role: "customer" };
        }
        return null;
      }
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials: any) {
        console.log('--- ADMIN LOGIN VERSUCH ---');
        console.log(`Eingegebener Benutzername: '${credentials?.username}'`);
        console.log(`Eingegebenes Passwort:     '${credentials?.password}'`);
        console.log(`Server-Benutzername (.env):  '${process.env.ADMIN_USER}'`);
        console.log(`Server-Passwort (.env):      '${process.env.ADMIN_PASSWORD}'`);

        if (
          credentials?.username === process.env.ADMIN_USER &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          console.log('VERGLEICH ERFOLGREICH!');
          return { id: "admin_user", name: "Admin", role: "admin" };
        }
        
        console.log('VERGLEICH FEHLGESCHLAGEN!');
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: '/'
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
