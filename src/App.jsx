import { useState, useEffect } from "react";

export default function App() {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Automatically redirect if user already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "admin") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = `/user-dashboard?user=${encodeURIComponent(
          user.username
        )}`;
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && !username.trim()) {
      setError("⚠️ Please enter your username.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("⚠️ Please fill in all fields.");
      return;
    }

    const url =
      mode === "login"
        ? "http://localhost/reactphp/login.php"
        : "http://localhost/reactphp/register.php";

    const body =
      mode === "login" ? { email, password } : { username, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.status === "success") {
        if (mode === "register") {
          alert("✅ Registration successful! You can now log in.");
          setMode("login");
          return;
        }

        // ✅ Login successful
        const user = data.user;
        alert(`Welcome ${user.username}! Role: ${user.role}`);

        // Save user info for dashboard use
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect
        const redirectUrl =
          data.redirect ||
          (user.role === "admin"
            ? "/admin-dashboard"
            : `/user-dashboard?user=${encodeURIComponent(user.username)}`);

        window.location.href = redirectUrl;
      } else {
        setError(data.message || "❌ Invalid credentials or server error.");
      }
    } catch (err) {
      console.error(err);
      setError("❌ Network error. Please try again later.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "40px 30px",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          {mode === "login" ? "🔐 Login" : "📝 Register"}
        </h2>

        {error && (
          <div
            style={{
              background: "#ffe6e6",
              color: "red",
              padding: "8px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        {mode === "register" && (
          <div style={{ marginBottom: "15px", textAlign: "left" }}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                marginTop: "5px",
                fontSize: "14px",
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px", textAlign: "left" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginTop: "5px",
              fontSize: "14px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {mode === "login" ? "Login" : "Register"}
        </button>

        <p style={{ marginTop: "15px", fontSize: "14px", color: "#333" }}>
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => {
                  setError("");
                  setMode("register");
                }}
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
