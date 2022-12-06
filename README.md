## Getting Started

1. Sign up for an [AWS Account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account)

2. Make sure you have the [Node.js 18.x](https://nodejs.org/en/) installed

3. Install `aws-cli` version 2 for your operating system. See the guide [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions). 

4. Create an IAM user with Admin permission or use the temperory credentails of a SSO user. Configure  credentials in the local machine. 
```sh
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
```

5. You shouldn't get any errors when you execute `aws s3 ls` That will confirm AWS credetials are locally setup correctly. 

## Step 01 - Frontend with React

1. Create a new react application with create-react-app. `npx create-react-app fuelpass`

2. Install bootstrap. 
``` sh
cd fuelpass
npm install bootstrap
npm i react-toastify
``` 

3. Update the `src/index.js` with the following code snippet

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

4. Update the `src/app.css` as follows
```css
.form-signin {
  max-width: 330px;
  padding: 15px;
}
```

5. Update the `src/app.js` with the following code snippet
```javascript
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
            <h4 className="h3 mb-3 fw-normal">Login </h4>
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
```

6. Go to the `fuelpass` folder and run `npm run start` to start the react web server and preview the frontend 