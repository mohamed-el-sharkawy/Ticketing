import { useState } from "react";
import Router from "next/router";
import useRequest from '../../hooks/use-request'

export default () => {
  const [email , setEmail] = useState('');
  const [password , setPassword] = useState('');
  
  const {doRequest , errors} = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: {
      email , password
    },
    onSuccess: () => {
      Router.push('/')
    }
  })

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  }

  return ( 
    <div className="auth-dev">
    <h1 className="title">Sign Up</h1>
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label className="auth-label">Email Address</label>
        <input value={email} onChange={e => {setEmail(e.target.value)}} className="form-control"></input>  
      </div>
      <div className="form-group">
        <label className="auth-label">Password</label>
        <input value={password} onChange={e => {setPassword(e.target.value)}}className="form-control" type="password"></input>  
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  </div>
  );
}