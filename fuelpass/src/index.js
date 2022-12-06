import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

// Manually configure amplify 
Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito Region
    region: 'us-east-1',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-east-1_gDayF7ydX',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '5dtdvgjq1eip1mu464jf9bln28',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,

    // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
    // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
    signUpVerificationMethod: 'code', // 'code' | 'link' 

    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    authenticationFlowType: 'CUSTOM_AUTH'
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
