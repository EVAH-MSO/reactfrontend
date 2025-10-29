import React, { useEffect, useState, useCallback } from "react";
import "./index.css";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  // --- STATE ---
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [transactions, setTransactions] = useState([]); // New state for transactions

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    category: "",
    image: null,
  });
  const [newMember, setNewMember] = useState({
    // New state for adding member
    username: "",
    email: "",
    password: "",
    role: "member",
  });
  const [transaction, setTransaction] = useState({
    username: "",
    bookTitle: "",
    dueDate: "",
    fineAmount: "",
    fineReason: "",
  });
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = "http://localhost/reactphp/admin.php";

  // --- RESPONSE HANDLER ---
  const handleResponse = async (res) => {
    const text = (await res.text())?.trim();
    if (!text) {
      throw new Error("Empty response from server");
    }

    try {
      const data = JSON.parse(text);
      if (data.error) {
        console.error("⚠️ Server Error:", data.error);
        alert(data.error);
      }
      return data;
    } catch (err) {
      console.error(err, "Invalid JSON:", text);
      throw new Error("Invalid JSON");
    }
  };

  // --- FETCH FUNCTIONS ---
  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_books`);
      const data = await handleResponse(res);
      setBooks(data.books || []);
    } catch (err) {
      console.error("❌ Fetch books error:", err.message);
    }
  }, [API_URL]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_users`);
      const data = await handleResponse(res);
      setMembers(data.users || []);
    } catch (err) {
      console.error("❌ Fetch members error:", err.message);
    }
  }, [API_URL]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=get_logs`);
      const data = await handleResponse(res);
      setActivity(data.logs || []);
    } catch (err) {
      console.error("❌ Fetch activity error:", err.message);
    }
  }, [API_URL]);

  const fetchTransactions = useCallback(async () => {
    // New fetch function
    try {
      const res = await fetch(`${API_URL}?action=get_transactions`);
      const data = await handleResponse(res);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("❌ Fetch transactions error:", err.message);
    }
  }, [API_URL]);

  // --- USE EFFECT (DATA FETCHING) ---
  useEffect(() => {
    fetchBooks();
    fetchMembers();
    fetchActivity();
    fetchTransactions();
  }, [fetchBooks, fetchMembers, fetchActivity, fetchTransactions]);

  // --- BOOKS HANDLERS ---
  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.category) {
      alert("⚠️ Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("title", newBook.title);
    formData.append("author", newBook.author);
    formData.append("category", newBook.category);
    if (newBook.image) formData.append("image", newBook.image);

    try {
      const res = await fetch(`${API_URL}?action=add_book`, {
        method: "POST",
        body: formData,
      });
      const data = await handleResponse(res);
      if (data.message) alert(data.message);
      fetchBooks();
    } catch (err) {
      console.error("❌ Add book error:", err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      const res = await fetch(`${API_URL}?action=delete_book&id=${id}`);
      const data = await handleResponse(res);
      if (data.message) alert(data.message);
      fetchBooks();
    } catch (err) {
      console.error("❌ Delete book error:", err.message);
    }
  };

  // --- MEMBER HANDLERS ---
  const handleAddMember = async () => {
    const { username, email, password, role } = newMember;
    if (!username || !email || !password) {
      alert("⚠️ Please fill all required fields");
      return;
    }
    try {
      const res = await fetch(`${API_URL}?action=add_user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });
      const data = await handleResponse(res);
      if (data.message) alert(data.message);
      fetchMembers(); // Refresh the members list
      setNewMember({ username: "", email: "", password: "", role: "member" }); // Clear form
    } catch (err) {
      console.error("❌ Add member error:", err.message);
    }
  };

  const handleDeleteMember = async (username) => {
    if (!window.confirm(`Delete user ${username}?`)) return;
    try {
      const res = await fetch(
        `${API_URL}?action=delete_user&username=${username}`
      );
      const data = await handleResponse(res);
      if (data.message) alert(data.message);
      fetchMembers(); // Refresh the members list
    } catch (err) {
      console.error("❌ Delete member error:", err.message);
    }
  };

  // --- TRANSACTION HANDLERS ---
  // 1. ISSUE BOOK
  const handleIssueBook = async () => {
    const { username, bookTitle, dueDate } = transaction;
    if (!username || !bookTitle || !dueDate) {
      alert("⚠️ Please fill all fields");
      return;
    }
    try {
      const res = await fetch(`${API_URL}?action=issue_book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          book_title: bookTitle,
          due_date: dueDate,
        }),
      });
      const data = await handleResponse(res);
      if (data.message) alert(data.message);

      // Refresh all relevant lists
      fetchBooks();
      fetchActivity();
      fetchTransactions(); // ⭐ Added this line
    } catch (err) {
      console.error("❌ Issue book error:", err.message);
    }
  };

  const handleReturnBook = async () => {
    if (!transaction.bookTitle) {
      alert("⚠️ Please select Book");
      return;
    }
    try {
      const res = await fetch(`${API_URL}?action=return_book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_title: transaction.bookTitle }),
      });
      const data = await handleResponse(res);
      if (data.message) alert(data.message);

      // Refresh all relevant lists
      fetchBooks();
      fetchActivity();
      fetchTransactions(); // ⭐ Added this line
    } catch (err) {
      console.error("❌ Return book error:", err.message);
    }
  };

  const handleIssueFine = async () => {
    const { username, fineAmount, fineReason } = transaction;
    if (!username || !fineAmount || !fineReason) {
      alert("⚠️ Please fill all fields");
      return;
    }
    try {
      const res = await fetch(`${API_URL}?action=issue_fine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          amount: fineAmount,
          reason: fineReason,
        }),
      });
      const data = await handleResponse(res);
      if (data.message) alert(data.message);
      fetchActivity();
    } catch (err) {
      console.error("❌ Issue fine error:", err.message);
    }
  };

  // --- FILTERING & CHART DATA ---
  const filteredBooks = books.filter(
    (b) =>
      (b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!categoryFilter || b.category === categoryFilter)
  );

  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Books Added",
        data: [10, 15, 20, 12, 18, 25, 15, 10, 5, 8, 12, 16], // Updated dummy data
        backgroundColor: "#f204beff",
      },
      {
        label: "Members Joined",
        data: [5, 10, 8, 14, 12, 15, 10, 7, 9, 11, 13, 17], // Updated dummy data
        backgroundColor: "#0c8becff",
      },
    ],
  };

  // --- DARK MODE TOGGLE ---
  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  // --- RENDER ---
  return (
    <div className={`dashboard-wrapper ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>📚 Library Admin</h2>
        <ul>
          <li
            onClick={() => setSelectedSection("dashboard")}
            className={selectedSection === "dashboard" ? "active" : ""}
          >
            Dashboard
          </li>
          <li
            onClick={() => setSelectedSection("books")}
            className={selectedSection === "books" ? "active" : ""}
          >
            Books
          </li>
          <li
            onClick={() => setSelectedSection("members")}
            className={selectedSection === "members" ? "active" : ""}
          >
            Members
          </li>
          <li
            onClick={() => setSelectedSection("transactions")}
            className={selectedSection === "transactions" ? "active" : ""}
          >
            Transactions
          </li>
          <li
            onClick={() => setSelectedSection("activity")}
            className={selectedSection === "activity" ? "active" : ""}
          >
            Activity
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Dashboard */}
        {selectedSection === "dashboard" && (
          <div className="dashboard-overview">
            <h2>📊 Overview</h2>
            <div className="stats-cards">
              <div className="card">📚 Books: {books.length}</div>
              <div className="card">👥 Members: {members.length}</div>
              <div className="card">
                ⏳ Issued:{" "}
                {transactions.filter((t) => t.status === "issued").length}
              </div>
            </div>
            <Bar data={chartData} />
          </div>
        )}

        {/* Books */}
        {selectedSection === "books" && (
          <div className="books-section">
            <h2>📚 Manage Books</h2>
            <div className="filters">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Fiction">Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
              </select>
            </div>

            <div className="add-book form-group">
              <h3>Add New Book</h3>
              <input
                placeholder="Title"
                value={newBook.title}
                onChange={(e) =>
                  setNewBook({ ...newBook, title: e.target.value })
                }
              />
              <input
                placeholder="Author"
                value={newBook.author}
                onChange={(e) =>
                  setNewBook({ ...newBook, author: e.target.value })
                }
              />
              <input
                placeholder="Category"
                value={newBook.category}
                onChange={(e) =>
                  setNewBook({ ...newBook, category: e.target.value })
                }
              />
              <input
                type="file"
                onChange={(e) =>
                  setNewBook({ ...newBook, image: e.target.files[0] })
                }
              />
              <button onClick={handleAddBook}>Add Book</button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.category}</td>
                      <td>
                        <button onClick={() => handleDeleteBook(b.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No books found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Members */}
        {selectedSection === "members" && (
          <div className="members-section">
            <h2>👥 Manage Members</h2>
            <div className="add-member form-group">
              <h3>Add New Member</h3>
              <input
                placeholder="Username"
                value={newMember.username}
                onChange={(e) =>
                  setNewMember({ ...newMember, username: e.target.value })
                }
              />
              <input
                placeholder="Email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
              />
              <input
                placeholder="Password"
                type="password"
                value={newMember.password}
                onChange={(e) =>
                  setNewMember({ ...newMember, password: e.target.value })
                }
              />
              <select
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({ ...newMember, role: e.target.value })
                }
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleAddMember}>Add Member</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.map((m) => (
                    <tr key={m.username}>
                      <td>{m.username}</td>
                      <td>{m.email}</td>
                      <td>{m.role}</td>
                      <td>
                        {m.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteMember(m.username)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions */}
        {selectedSection === "transactions" && (
          <div className="transactions-section">
            <h2>🔄 Transactions</h2>

            <div className="transaction-forms">
              {/* Issue Book */}
              <div className="form-group">
                <h3>Issue Book</h3>
                <select
                  value={transaction.username}
                  onChange={(e) =>
                    setTransaction({ ...transaction, username: e.target.value })
                  }
                >
                  <option value="">--Select User--</option>
                  {members.map((m) => (
                    <option key={m.username} value={m.username}>
                      {m.username}
                    </option>
                  ))}
                </select>
                <select
                  value={transaction.bookTitle}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      bookTitle: e.target.value,
                    })
                  }
                >
                  <option value="">--Select Book--</option>
                  {books.map((b) => (
                    <option key={b.title} value={b.title}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={transaction.dueDate}
                  onChange={(e) =>
                    setTransaction({ ...transaction, dueDate: e.target.value })
                  }
                />
                <button onClick={handleIssueBook}>Issue</button>
              </div>

              {/* Return Book */}
              <div className="form-group">
                <h3>Return Book</h3>
                <select
                  value={transaction.bookTitle}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      bookTitle: e.target.value,
                    })
                  }
                >
                  <option value="">--Select Book--</option>
                  {books.map((b) => (
                    <option key={b.title} value={b.title}>
                      {b.title}
                    </option>
                  ))}
                </select>
                <button onClick={handleReturnBook}>Return</button>
              </div>

              {/* Issue Fine */}
              <div className="form-group">
                <h3>Issue Fine</h3>
                <select
                  value={transaction.username}
                  onChange={(e) =>
                    setTransaction({ ...transaction, username: e.target.value })
                  }
                >
                  <option value="">--Select User--</option>
                  {members.map((m) => (
                    <option key={m.username} value={m.username}>
                      {m.username}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Amount"
                  type="number"
                  value={transaction.fineAmount}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      fineAmount: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Reason"
                  value={transaction.fineReason}
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      fineReason: e.target.value,
                    })
                  }
                ></textarea>
                <button onClick={handleIssueFine}>Issue Fine</button>
              </div>
            </div>

            <hr />

            <h3>Transaction History</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr
                      key={t.id}
                      className={
                        t.status === "issued" ? "issued-row" : "returned-row"
                      }
                    >
                      <td>{t.id}</td>
                      <td>{t.username}</td>
                      <td>{t.book_title}</td>
                      <td>{t.issue_date}</td>
                      <td>{t.due_date}</td>
                      <td>{t.return_date || "N/A"}</td>
                      <td>
                        <span className={`status ${t.status}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No transactions recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity */}
        {selectedSection === "activity" && (
          <div className="activity-section">
            <h2>📜 Activity Log</h2>
            {activity.length > 0 ? (
              <ul className="activity-list">
                {activity.map((a) => (
                  <li key={a.id}>
                    {/* Assuming the DB returns the timestamp in the details */}
                    **{a.details}**
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
