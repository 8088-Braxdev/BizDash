const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "log", label: "Log", icon: "+" },
  { id: "inventory", label: "Stock", icon: "▦" },
  { id: "analytics", label: "Stats", icon: "▲" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

function Navbar({ activeScreen, onNavigate }) {
  return (
    <div className="navbar">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-btn ${activeScreen === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Navbar;
