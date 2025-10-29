import React, { useEffect, useState, useCallback } from "react";
import book1 from "../src/assets/books/book1.jpg";
import book2 from "../src/assets/books/book2.jpg";
import book3 from "../src/assets/books/book3.jpg";
import book4 from "../src/assets/books/book4.jpg";
import book5 from "../src/assets/books/book5.jpg";
import book6 from "../src/assets/books/book6.jpg";
import book7 from "../src/assets/books/book7.jpg";
import book8 from "../src/assets/books/book8.jpg";  
import book9 from "../src/assets/books/book9.jpg";
import book10 from "../src/assets/books/book10.jpg";
import book11 from "../src/assets/books/book11.jpg";
import book12 from "../src/assets/books/book12.jpg";

import "./index.css";

const API_URL = "http://localhost/reactphp/user.php";

const UserDashboard = () => {
  // --- STATE ---
  const sessionUser =
    new URLSearchParams(window.location.search).get("user") ||
    new URLSearchParams(window.location.search).get("username");

  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState({});
  const [selectedUser, setSelectedUser] = useState(sessionUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fines, setFines] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const books = [
    { id: 1, title: "Book 1", image: book1 },
    { id: 2, title: "Book 2", image: book2 },
    { id: 3, title: "Book 3", image: book3 },
    { id: 4, title: "Book 4", image: book4 },
    { id: 5, title: "Book 5", image: book5 },
    { id: 6, title: "Book 6", image: book6 },
    { id: 7, title: "Book 7", image: book7 },
    { id: 8, title: "Book 8", image: book8 },
    { id: 9, title: "Book 9", image: book9 },
    { id: 10, title: "Book 10", image: book10 },
    { id: 11, title: "Book 11", image: book11 },
    { id: 12, title: "Book 12", image: book12 },

    
  ];

  // --- COMMON FETCH HANDLER ---
  const handleResponse = async (res) => {
    const text = (await res.text())?.trim();
    if (!text) {
      console.error("⚠️ Empty response from server");
      return {};
    }
    try {
      const data = JSON.parse(text);
      if (data.error) console.error("⚠️ Server Error:", data.error);
      return data;
    } catch (err) {
      console.error(err, "❌ Invalid JSON:", text);
      return {};
    }
  };

  // --- FETCH FUNCTIONS ---
  const fetchUser = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const data = await handleResponse(
        await fetch(`${API_URL}?action=get_user&username=${selectedUser}`)
      );
      if (data.user) {
        setUser(data.user);
        setIsAdmin(data.user.role === "admin");
      } else {
        setUser({ username: selectedUser, role: "member" });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }, [selectedUser]);

  const fetchUsersList = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const data = await handleResponse(
        await fetch(`${API_URL}?action=get_all_users`)
      );
      setUsersList(data.users || []);
    } catch (err) {
      console.error("Error fetching user list:", err);
    }
  }, [isAdmin]);

  const fetchTransactions = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const data = await handleResponse(
        await fetch(
          `${API_URL}?action=get_user_transactions&username=${selectedUser}`
        )
      );
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  }, [selectedUser]);

  const fetchFines = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const data = await handleResponse(
        await fetch(`${API_URL}?action=get_user_fines&username=${selectedUser}`)
      );
      setFines(data.fines || []);
    } catch (err) {
      console.error("Error fetching fines:", err);
    }
  }, [selectedUser]);

  const fetchActivity = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const data = await handleResponse(
        await fetch(
          `${API_URL}?action=get_user_activity&username=${selectedUser}`
        )
      );
      setActivity(data.logs || []);
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  }, [selectedUser]);

  // --- PAY FINE (Simulated M-Pesa) ---
  const handlePayFine = async (fine) => {
    const phone = prompt("Enter your M-Pesa number (+254XXXXXXXXX):");
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=pay_fine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUser,
          fine_id: fine.id,
          phone,
        }),
      });
      const data = await handleResponse(res);
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message || "Payment successful ✅");
        await fetchFines();
        await fetchActivity(); // ✅ Refresh activity to show new payment log
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (selectedUser) {
      fetchUser();
      fetchTransactions();
      fetchFines();
      fetchActivity();
      fetchUsersList();
    }
  }, [
    selectedUser,
    fetchUser,
    fetchTransactions,
    fetchFines,
    fetchActivity,
    fetchUsersList,
  ]);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  // --- RENDER ---
  const renderContent = () => {
    const unpaidFines = fines
      .filter((f) => f.status === "unpaid")
      .reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const issuedBooksCount = transactions.filter(
      (t) => t.status === "issued"
    ).length;

    const returnedBooksCount = transactions.filter(
      (t) => t.status === "returned"
    ).length;

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-overview">
            <h2>📊 My Summary</h2>
            <div className="stats-cards">
              <div className="card bg-info">
                📚 <b>Borrowed:</b> {issuedBooksCount}
              </div>
              <div className="card bg-warning">
                💸 <b>Unpaid Fines:</b> Ksh {unpaidFines.toFixed(2)}
              </div>
              <div className="card bg-success">
                ✅ <b>Returned:</b> {returnedBooksCount}
              </div>
            </div>
            {isAdmin && (
              <div className="admin-view-selector">
                <label>Viewing data for: </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {usersList.map((u) => (
                    <option key={u.username} value={u.username}>
                      {u.username} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="welcome-message">
              Welcome back, <b>{user.username}</b>! You are a <b>{user.role}</b>
              .
            </p>
            <div className="books-gallery">
              <h3>📚 GRAB OUR BOOK SPECIALS.</h3>
              <div className="books-grid">
                {books.map((book) => (
                  <div key={book.id} className="book-card">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="book-image"
                    />
                    <p>{book.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "transactions":
        return (
          <div className="transactions-section">
            <h2>🔄 My Issued Books</h2>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length ? (
                  transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.book_title}</td>
                      <td>{t.issue_date}</td>
                      <td>{t.due_date}</td>
                      <td>
                        <span className={`status ${t.status}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No transactions yet. Time to borrow some books!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "fines":
        return (
          <div className="fines-section">
            <h2>💸 My Fines</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reason</th>
                  <th>Amount (Ksh)</th>
                  <th>Date Issued</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.length ? (
                  fines.map((f) => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td>{f.reason}</td>
                      <td>{f.amount}</td>
                      <td>{f.created_at?.split(" ")[0] || "N/A"}</td>
                      <td>
                        <span className={`status ${f.status}`}>
                          {f.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {f.status === "unpaid" && (
                          <button
                            className="pay-button"
                            disabled={loading}
                            onClick={() => handlePayFine(f)}
                          >
                            {loading ? "Processing..." : "Pay Now"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No fines at the moment 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "activity":
        return (
          <div className="activity-section">
            <h2>🕒 My Activity Logs</h2>
            {activity.length ? (
              <ul className="activity-list">
                {activity.map((a) => (
                  <li key={a.id}>
                    <b>{a.details}</b> <small>({a.created_at})</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity yet.</p>
            )}
          </div>
        );

      case "profile":
        return (
          <div className="profile-section">
            <h2>👤 Profile Details</h2>
            <div className="profile-info">
              <p>
                <b>Username:</b> {user.username}
              </p>
              <p>
                <b>Email:</b> {user.email || "Not available"}
              </p>
              <p>
                <b>Role:</b> {user.role}
              </p>
            </div>
            <p>
              <small>
                For security, contact an Admin to change your password or email.
              </small>
            </p>
          </div>
        );

      default:
        return <div>Select a section from the sidebar.</div>;
    }
  };

  // --- MAIN ---
  return (
    <div className={`dashboard-wrapper ${darkMode ? "dark" : ""}`}>
      <aside className="sidebar">
        <h2>👋 {user.username || "Member"}</h2>
        <p className="user-role">{user.role || ""}</p>
        <hr />
        <ul>
          {["dashboard", "transactions", "fines", "activity", "profile"].map(
            (tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "active" : ""}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            )
          )}
        </ul>
        <div className="sidebar-bottom-controls">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
          <span className="toggle-label">
            {darkMode ? "Dark Mode" : "Light Mode"}
          </span>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <h1 className="topbar-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <button
            className="logout-button"
            onClick={() => (window.location.href = "/login")}
          >
            Logout
          </button>
        </div>
        {loading && <div className="loading-spinner">Loading...</div>}
        {renderContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
