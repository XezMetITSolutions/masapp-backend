export default function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚀 MASAPP Backend API</h1>
      <p>Backend API is running successfully!</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Available Endpoints:</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><code>GET /api/admin/auth/me</code> - User info</li>
          <li><code>POST /api/admin/auth/login</code> - Admin login</li>
          <li><code>POST /api/checkout</code> - Payment processing</li>
          <li><code>POST /api/translate</code> - AI translation</li>
        </ul>
      </div>
    </div>
  );
}

