import React from 'react';
import Login from './Login';
import Header from './components/Header';
import Footer from './components/Footer';

function LoginCard({ title, content }) {
  return (
    <>
    <Header/>
    <div className="card">
      
      {title && <h3 className="section-title">{title}</h3>}
      {content && <p>{content}</p>}
      <Login />
    </div>
    <Footer/>
    </>
  );
}

export default LoginCard;