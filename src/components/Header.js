import React from 'react';
import PropTypes from 'prop-types'
import {Link} from 'react-router-dom';

export const Header = () => (
  <header className="header">
    <nav className="navbar">
      <div className="nav-left">
        <NavItem 
          icon="home.png" 
          to="/" 
        />

        <NavItem 
          name="Projects" 
          to="/dashboard"
        />

        <div className="nav-item-wrapper">
          <div className="nav-item">
            <input placeholder="Search..." type="text"/>
          </div> 
        </div>

      </div>

      <div className="nav-right">
        <NavItem 
          name="Log in"
          to="/login"  
        />   
      </div>

    </nav>
  </header>
);

const NavItem = (props) => {
  
  const {to, name, icon} = props;

  return (
    
    <Link 
      to={to}
      className="nav-item-wrapper nav-item-button">
      
      <div className="nav-item">
        {!!icon && <img src={`/images/${icon}`} />}

        {!!name && <span> {name} </span>}
      </div> 
    </Link>
  )
}

