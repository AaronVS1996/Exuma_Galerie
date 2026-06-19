import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Personal OS – Dein persönliches Management Tool",
  description: "Aufgaben, Kalender, E-Mail, Routinen und KI-Coaching in einer App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1d27",
              color: "#e2e8f0",
              border: "1px solid #2e3347",
              borderRadius: "10px",
            },
          }}
        />
      </body>
    </html>
  );
}
