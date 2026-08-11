const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldApp = `export default function App() {
  return (
    <ViewportProvider>
      <NavigationProvider initialModule="offline">
        <AppContent />
      </NavigationProvider>
    </ViewportProvider>
  );
}`;

const newApp = `import { AuthProvider, useAuth } from "./logic/context/AuthContext";
import { LoginModule } from "./modules/auth/LoginModule";

function MainApp() {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginModule />;
  }
  
  return (
    <NavigationProvider initialModule="offline">
      <AppContent />
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <ViewportProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ViewportProvider>
  );
}`;

code = code.replace(oldApp, newApp);
fs.writeFileSync('src/App.tsx', code);
