import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users across all schools",
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
