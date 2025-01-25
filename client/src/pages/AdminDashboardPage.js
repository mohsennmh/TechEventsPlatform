// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           throw new Error('No token found. Please log in.');
//         }
  
//         const response = await axios.get('http://localhost:5000/api/auth/users', {
//           headers: { Authorization: `Bearer ${token}` },
//         });
  
//         setUsers(response.data);
//       } catch (error) {
//         console.error('Error fetching users:', error.response?.data || error.message);
//       }
//     };
  
//     fetchUsers();
//   }, []);
  

//   const handleDeleteUser = async (userId) => {
//     try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         alert('User deleted successfully');
//         setUsers(users.filter((user) => user._id !== userId)); // Remove user from the UI
//       } catch (error) {
//         console.error('Error deleting user:', error.response?.data || error.message);
//       }
//   };

//   const handleUpdateRole = async (userId, role) => {
//     const token = localStorage.getItem('token');
//     const response = await axios.patch(
//       `http://localhost:5000/api/auth/users/${userId}/role`,
//       { role },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     setUsers(users.map((user) => (user._id === userId ? response.data : user)));
//   };

//   return (
//     <div>
//       <h1>Admin Dashboard</h1>
//       <h2>Manage Users</h2>
//       <ul>
//         {users.map((user) => (
//           <li key={user._id}>
//             {user.name} ({user.email}) - {user.role}
//             <button onClick={() => handleUpdateRole(user._id, 'admin')}>Make Admin</button>
//             <button onClick={() => handleUpdateRole(user._id, 'organizer')}>Make Organizer</button>
//             <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err.response || err.message);
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in as admin to delete a user.');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted successfully.');
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err.response || err.message);
      alert('Failed to delete user.');
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user._id)} className="delete-user">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
