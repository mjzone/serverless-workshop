import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Auth, API } from "aws-amplify";

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState('');
  const [number, setNumber] = useState('');
  const password = Math.random().toString(10) + 'Abc#';
  const [userProfile, setUserProfile] = useState({ name: "", nic: "", address: "" });
  const userAPIName = "UserAPI";
  const userRootPath = "/users";

  useEffect(() => {
    verifyAuth();
  }, []);

  const getPayload = async (data = {}) => {
    return {
      body: data,
      headers: {
        Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
      }
    };
  }

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setSession(null);
        toast.success("You have logged in successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error("You are NOT logged in");
      });
  };


  const signIn = (e) => {
    if (e) {
      e.preventDefault();
      toast.success("Verifying number (Country code +XX needed)");
    }
    Auth.signIn(number)
      .then((result) => {
        setSession(result);
        toast("Enter OTP number");
      })
      .catch((err) => {
        if (err.code === 'UserNotFoundException') {
          signUp();
        } else if (err.code === 'UsernameExistsException') {
          toast("Enter OTP number");
          signIn();
        } else {
          console.log(err.code);
          console.error(err);
        }
      });
  };

  const signUp = async () => {
    await Auth.signUp({
      username: number,
      password,
      attributes: {
        phone_number: number,
      },
    });
    signIn();
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    Auth.sendCustomChallengeAnswer(session, otp)
      .then((user) => {
        setUser(user);
        setSession(null);
        toast.success("You have logged in successfully");
      })
      .catch((err) => {
        setOtp('');
        console.log(err);
        toast.error(err.message);
      });
  };

  const saveUserDetails = async (e) => {
    e.preventDefault(e);
    try {
      if (!userProfile.name || !userProfile.nic || !userProfile.address) {
        return;
      }
      const payload = await getPayload(userProfile);
      await API.post(userAPIName, userRootPath, payload);
    } catch (err) {
      toast.error(err.message);
      console.log('error creating user profile:', err);
    }
  }

  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp('');
      toast.success("You have logged out successfully");
    } else {
      toast.error("You are NOT logged in");
    }
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
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="xxxxx"
                onChange={(event) => setNumber(event.target.value)} />
              <label htmlFor="floatingInput">Phone Number (+94)</label>
            </div>
            <button className="w-100 btn btn-md btn-secondary" type="submit">Get OTP</button>
          </form>
        )}
        {!user && session && (
          <form onSubmit={verifyOtp}>
            <h4 className="h3 mb-3 fw-normal">OTP</h4>
            <div className="form-floating mb-2">
              <input
                type="text"
                className="form-control"
                id="floatingInput"
                placeholder="xxxxx"
                onChange={(event) => setOtp(event.target.value)}
                value={otp}
              />
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
                onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })} />
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
