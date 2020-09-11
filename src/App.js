import React from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name:'',
    email:'',
    password:'',
    photo:''
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbprovider = new firebase.auth.FacebookAuthProvider();

  const handelSignIn = () =>{
    firebase.auth().signInWithPopup(provider)
    .then(result =>{
      const {displayName, email, photoURL} = result.user;
      const signedUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedUser);
    })
    .catch(error => {
      console.log(error.message);
    })
  }

  const handelFbSignIn = () =>{
    firebase.auth().signInWithPopup(fbprovider)
    .then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

const handelSignOut = () =>{
  firebase.auth().signOut()
  .then(result =>{
    const logedOutUser = {
      isSignedIn: false,
      name:'',
      email:'',
      photo:'',
      error:'',
      success: false
    }
    setUser(logedOutUser);
  })
}

const handelBlur = (event)=>{
  let isFormValid = true;
  if(event.target.name === 'email'){
    isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
  }
  if(event.target.name === 'password'){
    const passLength = event.target.value.length > 6;
    const passHasNumber = /\d{1}/.test(event.target.value);
    isFormValid = passLength && passHasNumber;
  }
  if(isFormValid){
    const userInfo = {...user};
    userInfo[event.target.name] = event.target.value;
    setUser(userInfo);
  }

}

const handelSubmit = (e) =>{
  if(newUser && user.email && user.password){
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then(res => {
      const newUserInfo = {...user}
      newUserInfo.error = '';
      newUserInfo.success = true;
      setUser(newUserInfo);
      updateUserName(user.name);
    })
    .catch(error => {
      // Handle Errors here.
      const newUserInfo = {...user}
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
    });
  }
if(!newUser && user.email && user.password){
  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then(res =>{
    const newUserInfo = {...user}
      newUserInfo.error = '';
      newUserInfo.success = true;
      setUser(newUserInfo);
      console.log("sign in user info" , res.user);
  })
  .catch(error => {
    // Handle Errors here.
    const newUserInfo = {...user}
    newUserInfo.error = error.message;
    newUserInfo.success = false;
    setUser(newUserInfo);
   
  });
}

  e.preventDefault()
}

const updateUserName = name =>{
  var user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name
    }).then(function() {
      // Update successful.
      console.log("user name updated successfully");
    }).catch(function(error) {
      // An error happened.
      console.log(error);
    });

}

  return (
    <div className="App">
      {
         user.isSignedIn ? <button onClick={handelSignOut}>Sign Out</button> : 
         <button onClick={handelSignIn}>Sign In using Google</button>
      }
      <button onClick={handelFbSignIn}>Sign In using Facebook</button>
      {
       user.isSignedIn && <div>
         <p>WELCOME, {user.name}</p>
         <p>{user.email}</p>
         <img style={{height:150}} src={user.photo} alt=""/>
         </div>
      }
     <div>
       <h1>User Authentication</h1>
       <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="newUser" id=""/>
       <label htmlFor="newUser">New user sign up</label>
     <form onSubmit={handelSubmit}>
      {newUser && <input type="text" onBlur={handelBlur} name ='name' placeholder ='name'/>}
        <br/>
        <input type="text" onBlur={handelBlur} name ='email' placeholder ='email' required/>
        <br/>
        <input type="password" onBlur={handelBlur} name="password" placeholder ='pass' required/>
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
      </form>
      <p style={{color:'red'}}>{user.error}</p>
      {
        user.success && <p style={{color:'green'}}>user {newUser ? "created" :"logged In"} successfully</p>
      }
     </div>
    </div>
  );
}

export default App;
