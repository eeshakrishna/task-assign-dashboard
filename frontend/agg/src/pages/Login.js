import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          style={styles.input}
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    marginBottom: 30,
    fontWeight: "600",
    fontSize: "2.5rem",
    letterSpacing: "1px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: 350,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 10px 32px 0 rgba(31, 38, 135, 0.37)",
    backdropFilter: "blur(8.5px)",
    WebkitBackdropFilter: "blur(8.5px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },
  input: {
    marginBottom: 20,
    padding: "12px 15px",
    borderRadius: 6,
    border: "none",
    fontSize: "1rem",
    outline: "none",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "#fff",
  },
  button: {
    padding: "15px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#5a4dbf",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  }
};

export default Login;
