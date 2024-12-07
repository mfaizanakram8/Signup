import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Signup.css'
import { useNavigate } from 'react-router-dom';



function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    education: {
      degree: '',
      institution: '',
      graduationYear: ''
    },
    password: '',
    confirmPassword: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [cv, setCv] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const clearField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
    if (field === "email") {
      setEmailError("");
    }
    if (field === "phoneNumber") setPhoneError("");
  };
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
 
 const validatePhoneNumber = (phone) => {
  // Phone validation with regex
  const phoneRegex = /^[+]*[0-9]{1,4}[ -]?[0-9]{1,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
  if (!regex.test(password)) {
    setPasswordError('Password must be at least 8 characters long, include a number and a special character');
    return false;
  }
  setPasswordError('');
  return true;
};
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "password") {
    setFormData((prev) => {
      const updatedFormData = { ...prev, password: value };
      if (updatedFormData.confirmPassword !== value) {
        setConfirmPasswordError("Passwords do not match!");
      } else {
        setConfirmPasswordError("");
      }
      return updatedFormData;
    });
    validatePassword(value); 
  } else if (name === "confirmPassword") {
    setFormData((prev) => {
      const updatedFormData = { ...prev, confirmPassword: value };
      if (updatedFormData.password !== value) {
        setConfirmPasswordError("Passwords do not match!");
      } else {
        setConfirmPasswordError("");
      }
      return updatedFormData;
    });
  }else if (name === "email") {
    // Validate email
    if (!validateEmail(value)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  } else if (name === "phoneNumber") {
    if (!value || !validatePhoneNumber(value)) {
      setPhoneError("Enter a valid phone number");
    } else {
      setPhoneError("");
    }
  } else if (name.includes("education.")) {
    const educationField = name.split(".")[1];
    setFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [educationField]: value,
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  

 

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: value,
      countryCode: country.countryCode
    }));
  
   
    if (value.length < 12 || value.length > 15) {
      setPhoneError("Enter a valid phone number");
    } else {
      setPhoneError(""); 
    }
  };

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setMessage('Profile picture must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('CV must be less than 10MB');
        return;
      }
      setCv(file);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match!");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords don't match!");
    } else {
      setConfirmPasswordError('');
    }
    
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return false;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setMessage("Please enter a valid email");
      return false;
    }

    // Validate phone number length
    const phoneNumberLength = formData.phoneNumber.length;
    if (phoneNumberLength < 12 || phoneNumberLength > 15) {
        setMessage("Enter a valid phone number.");
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add password validation
    if (!validatePassword(formData.password)) {
      setMessage('Password does not meet the required criteria!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match!");
      return;
    }

    if (passwordError) {
      setMessage('Please fix the password error.');
      return;
    }
  
    if (!validateForm()) return;
    
    setLoading(true);
    const formDataToSend = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      if (key === 'education') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key !== 'confirmPassword') {
        formDataToSend.append(key, formData[key]);
      }
    });
  
    // Add files
    if (profilePicture) {
      formDataToSend.append('profilePicture', profilePicture);
    }
    if (cv) {
      formDataToSend.append('cv', cv);
    }
  
    try {
      const response = await fetch('http://localhost:8081/signup', {
        method: 'POST',
        body: formDataToSend
      });
  
      const data = await response.json();
      
      if (data.error) {
        setMessage(data.error);
      } else {
        setMessage('Signup successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className='d-flex w-100 min-vh-100 bg-primary justify-content-center align-items-center'>
      <div className='bg-white p-4 rounded-3 shadow' style={{ maxWidth: '600px', width: '90%' }}>
        <h2 className='text-center mb-4'>Sign Up</h2>
        
        {/* Profile Picture Preview */}
        {profilePreview && (
          <div className='text-center mb-3'>
            <img 
              src={profilePreview} 
              alt="Profile Preview" 
              className='rounded-circle'
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          </div>
        )}

        {message && (
          <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Upload */}
          <div className='mb-3'>
            <label className='form-label'>Profile Picture</label>
            <input
              type='file'
              className='form-control'
              accept='image/*'
              onChange={handleProfilePicture}
            />
            <small className="text-muted">Max size: 5MB</small>
          </div>

          {/* Name Fields */}
          <div className='row mb-3'>
            <div className='col'>
              <label className='form-label'>First Name</label>
              <input
                type='text'
                className='form-control'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className='col'>
              <label className='form-label'>Last Name</label>
              <input
                type='text'
                className='form-control'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {/* genderfield */}
          <div className="mb-3">
  <label className="form-label">Gender</label>
  <div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="gender"
        value="Male"
        onChange={handleChange}
        required
      />
      <label className="form-check-label">Male</label>
    </div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="gender"
        value="Female"
        onChange={handleChange}
      />
      <label className="form-check-label">Female</label>
    </div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="gender"
        value="Other"
        onChange={handleChange}
      />
      <label className="form-check-label">Other</label>
    </div>
  </div>
</div>

{/* Date of Birth Field */}
<div className="mb-3">
  <label className="form-label">Date of Birth</label>
  <input
    type="date"
    className="form-control"
    name="dob"
    value={formData.dob || ""}
    onChange={handleChange}
    required
  />
</div>

{/* Country Dropdown */}
<div className="mb-2">
        <label className="form-label">Country</label>
        <select
          className="form-control"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select Country
          </option>
          <option value="Pakistan">Pakistan</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Australia">Australia</option>
        </select>
      </div>

    
      {/* State Dropdown */}
      <div className="mb-2">
        <label className="form-label">State</label>
        <select
          className="form-control"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        >
          <option value="" disabled>
            Select State
          </option>
          <option value="Punjab">Punjab</option>
          <option value="KPK">KPK</option>
          <option value="Balochistan">Balochistan</option>
          <option value="Sindh">Sindh</option>
        </select>
      </div>


      {/* Address Field */}
      <div className="mb-2">
        <label className="form-label">Address</label>
        <textarea
          className="form-control"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your full address"
          rows="3"
          required
        ></textarea>
      </div>
     
        {/* Email Field */}
        <div className="mb-3">
            <label className="form-label">Email address</label>
            <div className="position-relative">
              <input
                type="email"
                className={`form-control ${
                  emailError ? "border-danger" : formData.email ? "border-success" : ""
                }`}
                name="email"
                
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formData.email && (
                <span
                  className="position-absolute top-50 end-0 translate-middle-y  me-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => clearField("email")}
                >
                  {emailError ? "❌" : "✔️"}
                </span>
              )}
            </div>
            {emailError && <small className="text-danger">{emailError}</small>}
            {!emailError && formData.email && (
              <small className="text-success">Valid email</small>
            )}
          </div>

          {/* Phone Number */}
          <div className="mb-3">
  <label className="form-label">Phone Number</label>
  <div className="position-relative">
    <PhoneInput
      country={"pk"}
      value={formData.phoneNumber}
      onChange={handlePhoneChange}
      inputClass={`form-control ${
        phoneError ? "border-danger" : formData.phoneNumber ? "border-success" : ""
      }`}
      containerClass="mb-3"
    />
    {formData.phoneNumber && (
      <span
        className="position-absolute top-50 end-0 translate-middle-y me-2"
        style={{ cursor: "pointer" }}
        onClick={() => clearField("phoneNumber")}
      >
        {phoneError ? "❌" : "✔️"}
      </span>
    )}
  </div>
  {phoneError && <small className="text-danger">{phoneError}</small>}
  {!phoneError && formData.phoneNumber && (
    <small className="text-success">Valid phone number</small>
  )}
</div>

            

          {/* Education */}
          <div className='mb-3'>
            <h5>Education</h5>
            <div className='mb-2'>
  <label className='form-label'>Degree</label>
  <select
    className='form-control'
    name='education.degree'
    value={formData.education.degree}
    onChange={handleChange}
    required
  >
    <option value='' disabled>
      Select Degree
    </option>
    <option value='Matric'>Matric</option>
    <option value='FSc'>FSc</option>
    <option value='Bachelors'>Bachelors</option>
    <option value='Masters'>Masters</option>
    <option value='MPhil'>MPhil</option>
    <option value='PhD'>PhD</option>
  </select>
</div>

            <div className='mb-2'>
              <label className='form-label'>Institution</label>
              <input
                type='text'
                className='form-control'
                name='education.institution'
                value={formData.education.institution}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
  <label className="form-label">Start Year</label>
  <input
    type="date"
    className="form-control"
    name="startYear"
    value={formData.education.startYear}
    onChange={(e) =>
      setFormData((prevData) => ({
        ...prevData,
        education: {
          ...prevData.education,
          startYear: e.target.value,
        },
      }))
    }
    required
  />
</div>

<div className="mb-2">
  <label className="toggle-switch">
    <input
      type="checkbox"
      name="isOngoing"
      checked={formData.isOngoing}
      onChange={(e) =>
        setFormData((prevData) => ({
          ...prevData,
          isOngoing: e.target.checked,
        }))
      }
    />
    <span className="toggle-slider"></span>
  </label>
  <span style={{ marginLeft: "10px" }}>Ongoing</span>
</div>



{!formData.isOngoing && (
  <div className="mb-2">
    <label className="form-label">End Date</label>
    <input
      type="date"
      className="form-control"
      name="endDate"
      value={formData.endDate}
      onChange={(e) =>
        setFormData((prevData) => ({
          ...prevData,
          endDate: e.target.value,
        }))
      }
      required={!formData.isOngoing}
    />
  </div>
)}

          </div>

          {/* CV Upload */}
          <div className='mb-3'>
            <label className='form-label'>CV/Resume</label>
            <input
              type='file'
              className='form-control'
              accept='.pdf,.doc,.docx'
              onChange={handleCvUpload}
            />
            <small className="text-muted">Max size: 10MB</small>
          </div>

    
{/* Password Field */}
<div className="mb-3">
  <label className="form-label">Password</label>
  <div className="position-relative">
    <input
      type={passwordVisible ? "text" : "password"}
      className={`form-control ${
        passwordError ? "border-danger" : formData.password ? "border-success" : ""
      }`}
      name="password"
      value={formData.password}
      onChange={handleChange}
      required
    />
    <span
      className="position-absolute top-50 end-0 translate-middle-y me-2"
      style={{ cursor: "pointer" }}
      onClick={() => setPasswordVisible(!passwordVisible)}
    >
      {passwordVisible ? "👁️" : "🙈"}
    </span>
  </div>
  {passwordError && <small className="text-danger">{passwordError}</small>}
  {!passwordError && formData.password && (
    <small className="text-success">Valid password</small>
  )}

</div>

{/* Confirm Password Field */}
<div className="mb-3">
  <label className="form-label">Confirm Password</label>
  <div className="position-relative">
    <input
      type={confirmPasswordVisible ? "text" : "password"}
      className={`form-control ${
        confirmPasswordError ? "border-danger" : formData.confirmPassword ? "border-success" : ""
      }`}
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      required
    />
    <span
      className="position-absolute top-50 end-0 translate-middle-y me-2"
      style={{ cursor: "pointer" }}
      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
    >
      {confirmPasswordVisible ? "👁️" : "🙈"}
    </span>
  </div>
  {confirmPasswordError && <small className="text-danger">{confirmPasswordError}</small>}
  {!confirmPasswordError && formData.confirmPassword && (
    <small className="text-success">Passwords match</small>
  )}
</div>


          <button 
            type='submit' 
            className='btn btn-primary w-100' 
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className='text-center mt-3'>
          Already have an account? <a href='/login'>Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;   