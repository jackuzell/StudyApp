import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

const AuthForm = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleMode = (loginMode) => {
        setIsLogin(loginMode);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        const url = `${API_URL}/${isLogin ? 'login' : 'signup'}`;

        try {
            const payload = isLogin 
                ? { email: email.trim(), password } 
                : { username: username.trim(), email: email.trim(), password };
            const response = await axios.post(url, payload);
            onLogin(response.data); 
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.msg || 'Unable to connect to server. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-badge-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </div>
                    <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                    <p className="auth-subtitle">
                        {isLogin 
                            ? 'Enter your credentials to access your study library' 
                            : 'Upload notes, generate AI summaries and test yourself with quizzes'}
                    </p>
                </div>

                <div className="auth-tab-switch">
                    <button 
                        type="button"
                        className={`tab-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => toggleMode(true)}
                    >
                        Sign In
                    </button>
                    <button 
                        type="button"
                        className={`tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => toggleMode(false)}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className="alert-banner alert-error" role="alert">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Full Name / Username</label>
                            <input 
                                id="username"
                                type="text"
                                placeholder="e.g. Alex Miller"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={!isLogin}
                                disabled={loading}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input 
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password"
                            placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? (
                            <span className="btn-spinner-content">
                                <span className="spinner-sm"></span>
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <button 
                        type="button" 
                        className="text-link-btn"
                        onClick={() => toggleMode(!isLogin)}
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;