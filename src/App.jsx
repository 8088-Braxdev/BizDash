import { useEffect, useState } from "react";

//screens
import Splash from "./screens/Splash";
import Auth from "./screens/Auth";
import Dashboard from "./screens/Dahboard";
import Navbar from "./screens/Navbar";
import Log from "./screens/Log";
import Inventory from "./screens/Inventory";
import Analytics from "./screens/Analytics";
import Settings from "./Settings";

function App() {
const [screen, setScreen] = useState('splash');
const [activeTab, setActiveTab] = useState('dashboard');

useEffect(() => {
const timer = setTimeout(() => {
setScreen('auth');
}, 1800);

return () => clearTimeout(timer);
}, []);

const isLoggedIn = screen === 'app';

return (
<div className="app-shell">
{screen === 'splash' && <Splash />}
{screen === 'auth' && <Auth onLogin={() => setScreen('app')} />}

{isLoggedIn && (
<>
{activeTab === 'dashboard' && <Dashboard />}
{activeTab === 'log' && <Log/>}
{activeTab === 'inventory' && <Inventory/>}
{activeTab === 'analytics' && <Analytics/>}
{activeTab === 'settings' && <Settings/>}

<Navbar activeScreen={activeTab} onNavigate={setActiveTab} />
</>
)}
</div>
);
}
export default App;