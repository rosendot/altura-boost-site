import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Altura Boost",
  description: "Gaming service website for boosting and orders",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
