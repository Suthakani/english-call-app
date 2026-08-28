// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import api from "../api/axiosConfig.js";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post("/auth/login", form);
//       login(data.user, data.token);
//       navigate(data.user.level === "unassigned" ? "/level-test" : "/categories");
//     } catch (err) {
//       if (err.response?.status === 403) {
//         navigate("/verify-email", { state: { userId: err.response.data.userId, email: form.email } });
//         return;
//       }
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <div className="auth-card">
//         <h1>🎙️ SpeakUp</h1>
//         <p className="subtitle">Welcome back</p>
//         <form onSubmit={handleSubmit}>
//           <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
//           <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
//           {error && <p className="error">{error}</p>}
//           <button type="submit">Login</button>
//         </form>
//         <p>New here? <Link to="/register">Create an account</Link></p>
//       </div>
//     </div>
//   );
// }
