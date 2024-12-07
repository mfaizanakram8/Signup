import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Modal from "react-bootstrap/Modal";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCvModal, setShowCvModal] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.user) {
        setUserData(data.user);
        setEditedData(data.user);
      } else {
        throw new Error(data.error || "Failed to fetch user data");
      }
    } catch (err) {
      setMessage("Error fetching profile data");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [navigate, fetchUserData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("education.")) {
      const field = name.split(".")[1];
      setEditedData((prev) => ({
        ...prev,
        education: {
          ...prev.education,
          [field]: value,
        },
      }));
    } else {
      setEditedData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneChange = (value, country) => {
    setEditedData((prev) => ({
      ...prev,
      phoneNumber: value,
      countryCode: country.countryCode,
    }));
  };

  const handleSave = async () => {
    // Validate phone number length
    const phoneNumberLength = editedData.phoneNumber.replace(/\D/g, "").length; // Remove non-digit characters
    if (phoneNumberLength < 12 || phoneNumberLength > 15) {
      setMessage("Enter a valid phone number");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();
      if (data.status === "Success") {
        setUserData(editedData);
        setIsEditing(false);
        setMessage("Profile updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err) {
      setMessage("Error updating profile");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8081/profile/update-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();
        console.log("Upload response:", data);

        if (data.status === "Success") {
          setUserData((prev) => ({
            ...prev,
            profilePicture: data.profilePicture,
          }));
          setMessage("Profile picture updated successfully!");
          fetchUserData();
        } else {
          throw new Error(data.error || "Failed to update profile picture");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        setMessage(err.message || "Error updating profile picture");
      }
    }
  };

  const handleCvUpdate = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("cv", file);

        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8081/profile/update-cv",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (response.ok && data.status === "Success") {
          setUserData((prev) => ({
            ...prev,
            cv: data.cv,
          }));
          setMessage("CV updated successfully!");
          await fetchUserData();
        } else {
          throw new Error(data.error || "Failed to update CV");
        }
      } catch (err) {
        console.error("Error uploading CV:", err);
        setMessage(err.message || "Error updating CV");
      }
    }
  };

  const renderCvPreview = () => {
    if (!userData.cv) {
      return (
        <div className="text-center p-5">
          <i className="fas fa-file-upload fa-3x mb-3 text-muted"></i>
          <p>No CV uploaded yet</p>
        </div>
      );
    }

    const fileUrl = `http://localhost:8081/${userData.cv}`;
    const ext = userData.cv.split(".").pop().toLowerCase();

    const renderDocumentPreview = (type) => {
      const icons = {
        pdf: "fa-file-pdf",
        doc: "fa-file-word",
        docx: "fa-file-word",
      };

      const titles = {
        pdf: "PDF Document",
        doc: "Microsoft Word Document",
        docx: "Microsoft Word Document",
      };

      const colors = {
        pdf: "#dc3545", // Red for PDF
        doc: "#2b579a", // Blue for Word
        docx: "#2b579a", // Blue for Word
      };

      const getViewerUrl = () => {
        if (ext === "pdf") {
          return fileUrl;
        }
        // For Word documents, use Office Online viewer
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          fileUrl
        )}`;
      };

      return (
        <div className="text-center py-5">
          <div className="doc-icon mb-4">
            <i
              className={`fas ${icons[ext]} fa-5x`}
              style={{ color: colors[ext] }}
            ></i>
            <div className="mt-2 text-muted small">
              {userData.cv.split("/").pop()}
            </div>
          </div>
          <h5 className="mb-3">{titles[ext]}</h5>
          <div className="d-flex justify-content-center gap-2">
            <a href={fileUrl} className="btn btn-primary" download>
              <i className="fas fa-download me-2"></i>
              Download
            </a>
            <a
              href={getViewerUrl()}
              className="btn btn-outline-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-eye me-2"></i>
              View
            </a>
          </div>
        </div>
      );
    };

    return (
      <div className="preview-wrapper">
        <div className="preview-content">
          <div className="preview-page">
            {["pdf", "doc", "docx"].includes(ext) ? (
              renderDocumentPreview(ext)
            ) : ["jpg", "jpeg", "png"].includes(ext) ? (
              <div className="image-preview">
                <img
                  src={fileUrl}
                  alt="CV Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-file-alt fa-4x mb-3 text-primary"></i>
                <h5>Document Preview</h5>
                <p className="text-muted">
                  This type of file cannot be previewed
                </p>
                <a
                  href={fileUrl}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  Open File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div>Error loading profile</div>;
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Profile Picture Column */}
        <div className="col-md-4 text-center mb-4">
          <div className="card">
            <div className="card-body">
              <div className="position-relative d-inline-block">
                <img
                  src={`http://localhost:8081/${userData.profilePicture}`}
                  alt="Profile"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/200";
                  }}
                />
                <label
                  className="btn btn-primary rounded-circle position-absolute"
                  style={{
                    width: "35px",
                    height: "35px",
                    bottom: "30px",
                    right: "10px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <h3>
                {userData.firstName} {userData.lastName}
              </h3>
              {userData.cv && (
                <>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => setShowCvModal(true)}
                  >
                    View CV
                  </button>

                  <Modal
                    show={showCvModal}
                    onHide={() => setShowCvModal(false)}
                    size="xl"
                    dialogClassName="preview-modal"
                  >
                    <Modal.Header
                      closeButton
                      className="py-2 bg-dark text-white"
                    >
                      <Modal.Title className="fs-6">
                        <i className="fas fa-file me-2"></i>
                        Document Preview
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0">
                      <div className="preview-toolbar">
                        <div className="d-flex justify-content-between align-items-center p-2">
                          <div className="d-flex align-items-center">
                            <label className="btn btn-primary btn-sm me-2">
                              <i className="fas fa-upload me-1"></i>
                              Update Document
                              <input
                                type="file"
                                className="d-none"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleCvUpdate}
                              />
                            </label>
                            {message && (
                              <span
                                className={`small ${
                                  message.includes("success")
                                    ? "text-success"
                                    : "text-danger"
                                }`}
                              >
                                {message}
                              </span>
                            )}
                          </div>
                          {userData.cv && (
                            <div>
                              <a
                                href={`http://localhost:8081/${userData.cv}`}
                                className="btn btn-outline-secondary btn-sm"
                                download
                              >
                                <i className="fas fa-download me-1"></i>
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      {renderCvPreview()}
                    </Modal.Body>
                  </Modal>
                </>
              )}
              <button
                className="btn btn-danger mt-3 w-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* User Details Column */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              {message && (
                <div
                  className={`alert ${
                    message.includes("successfully")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title">Profile Details</h4>
                {!isEditing ? (
                  <button className="btn btn-primary" onClick={handleEdit}>
                    Edit Profile
                  </button>
                ) : (
                  <div>
                    <button
                      className="btn btn-success me-2"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <form>
                {/* Personal Information */}
                <h5 className="mb-3">Personal Information</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={
                        isEditing ? editedData.firstName : userData.firstName
                      }
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={
                        isEditing ? editedData.lastName : userData.lastName
                      }
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={userData.email}
                    disabled
                  />
                  <small className="text-muted">Email cannot be changed</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  {isEditing ? (
                    <PhoneInput
                      country={"pk"}
                      value={editedData.phoneNumber}
                      onChange={handlePhoneChange}
                      inputClass="form-control"
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      value={userData.phoneNumber}
                      disabled
                    />
                  )}
                </div>

                {/* Education Information */}
                <h5 className="mb-3 mt-4">Education</h5>
                <div className="mb-3">
                  <label className="form-label">Degree</label>
                  <input
                    type="text"
                    className="form-control"
                    name="education.degree"
                    value={
                      isEditing
                        ? editedData.education.degree
                        : userData.education.degree
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Institution</label>
                  <input
                    type="text"
                    className="form-control"
                    name="education.institution"
                    value={
                      isEditing
                        ? editedData.education.institution
                        : userData.education.institution
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    className="form-control"
                    name="education.graduationYear"
                    value={
                      isEditing
                        ? editedData.education.graduationYear
                        : userData.education.graduationYear
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
