import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const url = `${API_URL}/${isLogin ? 'login' : 'signup'}`;
        
        try {
            const payload = isLogin ? { email, password } : { username, email, password };
            const response = await axios.post(url, payload);
            onLogin(response.data); 
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
        }
    };
    
    return (
        <div className="auth-form-section">
            <h2>{isLogin ? 'Login' : 'Signup'}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <input 
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                )}
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Need an account? Signup' : 'Already have an account? Login'}
            </p>
        </div>
    );
};

export default AuthForm;