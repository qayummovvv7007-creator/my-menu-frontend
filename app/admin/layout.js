export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 pb-20 md:pb-0 md:pl-64">
    

      {/* Main Content */}
      <main className="p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}