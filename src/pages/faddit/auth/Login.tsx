import React from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <>
      <h2 className='text-3xl font-extrabold mb-6 text-center text-gray-900'>Sign in to Faddit</h2>
      <div className='border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-500 rounded-lg'>
        <p>Login Form Component Placeholder</p>
      </div>
      <div className='mt-6 text-center text-sm'>
        <span className='text-gray-600'>Don't have an account? </span>
        <Link to='/faddit/sign/up' className='font-medium text-indigo-600 hover:text-indigo-500'>
          Sign up
        </Link>
      </div>
    </>
  );
};

export default Login;
