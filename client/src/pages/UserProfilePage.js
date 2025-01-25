import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/UserProfilePage.css';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [profilePicture, setProfilePicture] = useState('/default-avatar.png');
  const [selectedFileName, setSelectedFileName] = useState('No file chosen');
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('You must log in to view your profile.');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setRole(userData.role);
        const savedPicture = localStorage.getItem('profilePicture');
        setProfilePicture(savedPicture || userData.profilePicture || '/default-avatar.png');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to load profile data.');
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const updateData = { name, email };
      if (password) updateData.password = password;

      const response = await axios.post(
        'http://localhost:5000/api/auth/update-profile',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message || 'Profile updated successfully!');
      setPassword('');
      setEditMode(false); // Exit edit mode after saving
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
  
    setSelectedFileName(file.name);
  
    const formData = new FormData();
    formData.append('profilePicture', file);
  
    try {
      const token = localStorage.getItem('token');  // Retrieve the token from localStorage (current authenticated user's token)
      if (!token) {
        alert('You must be logged in to upload a profile picture');
        return;
      }
  
      const response = await axios.post('http://localhost:5000/api/auth/profile-picture', formData, {
        headers: {
          Authorization: `Bearer ${token}`,  // Send the token with the request
        },
      });
      const uploadedPicture = `http://localhost:5000${response.data.profilePicture}`;
      setProfilePicture(uploadedPicture);
      localStorage.setItem('profilePicture', uploadedPicture);
      setMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setMessage('Failed to upload profile picture.');
    }
  };
  

  if (!user) {
    return <p className="error-message">Unable to load profile. Please try again later.</p>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img src={profilePicture} alt="Profile" className="profile-picture" />
          <h1 className="profile-name">{name}</h1>
          <p className="profile-role">{role}</p>
        </div>

        {editMode ? (
          <form className="profile-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (optional)"
              />
            </div>
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="custom-file-input">
                <input
                  type="file"
                  accept="image/*"
                  id="profilePictureInput"
                  onChange={handlePictureUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePictureInput" className="upload-button">
                  Choose File
                </label>
                <span className="file-name">{selectedFileName}</span>
              </div>
            </div>
            <button type="submit" className="update-button" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="profile-details">
            <p>
              <strong>Email:</strong> {email}
            </p>
            <p>
              <strong>Role:</strong> {role}
            </p>
          </div>
        )}

        <div className="profile-footer">
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="toggle-edit-button"
            disabled={loading}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
          {message && <p className="update-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
