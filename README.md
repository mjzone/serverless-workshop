## Step 04 - Manual configure Auth category in the Frontend

1. Under `fuelpass` folder install `aws-amplify` javascript library
  ```sh
     npm install aws-amplify
  ```
2. Go to `fuelpass/src/index.js`
```typescript
  ...
  import { Amplify } from 'aws-amplify';

  // Manually configure amplify 
  Amplify.configure({
    Auth: {
      // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: '<userpool_id>',

      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: '<userpool_client_id>',

      // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
      mandatorySignIn: true,

      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: 'code', // 'code' | 'link' 

      // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
      authenticationFlowType: 'CUSTOM_AUTH'
    }
  });
```

3. Goto `fuelpass/src/App.js` and update the code as follows
```javascript
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

    useEffect(() => {
      verifyAuth();
    }, []);

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
      e.preventDefault();
      toast.success("Verifying number (Country code +XX needed)");
      Auth.signIn(number)
        .then((result) => {
          setSession(result);
          toast("Enter OTP number");
        })
        .catch((e) => {
          if (e.code === 'UserNotFoundException') {
            signUp();
          } else if (e.code === 'UsernameExistsException') {
            toast("Enter OTP number");
            signIn();
          } else {
            console.log(e.code);
            console.error(e);
          }
        });
    };

    const signUp = async () => {
      const result = await Auth.signUp({
        username: number,
        password,
        attributes: {
          phone_number: number,
        },
      }).then(() => signIn());
      return result;
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

    const saveUserDetails = (e) => {
      e.preventDefault();
      console.log("Saved use details");
    };

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
                  onChange={(e) => setUserProfile({ ...userProfile, nic: e.target.value })} />
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

3. Deploy the changes `npm run deploy` at the `fuelpass` folder

4. Verify your phone number in the SNS console (Sandbox)