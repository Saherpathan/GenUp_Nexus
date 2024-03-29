import React from 'react'
import Background from "../Background/Background";
import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div>
      <Background />
      Landing
      <Link to={'./user'}><Button>User</Button></Link>
      <Link to={'./login'}><Button>Login</Button></Link>
      <Link to={'./register'}><Button>Register</Button></Link>
    </div>
  )
}

export default Landing;