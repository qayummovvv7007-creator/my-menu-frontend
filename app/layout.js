import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="max-w-[450px]  mx-auto">
          <div className="">{children}</div>
        
      </body>
    </html>
  );
}
