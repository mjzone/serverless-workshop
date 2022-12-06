import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
  const password = Math.random().toString(10) + 'Abc#';
  const [userProfile, setUserProfile] = useState({ name: "", nic: "", address: "" });

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = () => {
    console.log("Verify Auth");
  }

  const signIn = () => {
    console.log("Signed in");
    //toast.success("Signed in successfully!");
  };

  const verifyOtp = () => {
    console.log("OTP verified");
  };

  const saveUserDetails = () => {
    console.log("Saved use details");
  };

  const signOut = () => {
    console.log("Signed out");
    toast.success("Signed out successfully!");
  };

  return (
    <div className="container">
      <ToastContainer />
      <header className="d-flex justify-content-center py-3">
        <ul className="nav nav-pills">
          <li className="nav-item"><a href="#" className="nav-link active" aria-current="page">Personal Details</a></li>
          <li className="nav-item"><a href="#" className="nav-link">Vehicle Details</a></li>
          <li className="nav-item"><a href="#" className="nav-link" onClick={signOut}>Sign Out</a></li>
        </ul>
      </header>
      <main className="form-signin w-100 m-auto">
        {!user && !session && (
          <form onSubmit={signIn}>
            <h4 className="h3 mb-3 fw-normal">Login - Edited</h4>
            <div className="form-floating mb-2">
              <input type="text" className="form-control" id="floatingInput" placeholder="xxxxx" />
              <label htmlFor="floatingInput">Phone Number (+94)</label>
            </div>
            <button className="w-100 btn btn-md btn-secondary" type="submit">Get OTP</button>
          </form>
        )}
        {!user && session && (
          <form onSubmit={verifyOtp}>
            <h4 className="h3 mb-3 fw-normal">OTP</h4>
            <div className="form-floating mb-2">
              <input type="text" className="form-control" id="floatingInput" placeholder="xxxxx" />
              <label htmlFor="floatingInput">Enter OTP</label>
            </div>
            <button className="w-100 btn btn-lg btn-secondary" type="submit">Confirm</button>
          </form>
        )}
        {user && (
          <form onSubmit={saveUserDetails}>
            <h4 className="h3 mb-3 fw-normal">User Details</h4>
            <div className="form-floating mb-2">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="xxxxx"
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })} />
              <label htmlFor="floatingInput">Name</label>
            </div>
            <div className="form-floating mb-2">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="xxxxx"
                onChange={(e) => setUserProfile({ ...userProfile, nic: e.target.value })} />
              <label htmlFor="floatingInput">NIC</label>
            </div>
            <div className="form-floating mb-2">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="xxxxx"
                onChange={(e) => setUserProfile({ ...userProfile, nic: e.target.value })} />/>
              <label htmlFor="floatingInput">Address</label>
            </div>
            <button className="w-100 btn btn-lg btn-secondary" type="submit">Save</button>
          </form>
        )}
      </main>
    </div>

  );
}

export default App;
