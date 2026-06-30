import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('Male');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isSignup) {
                // 1. Supabase Auth table me user create karo
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;

                if (data?.user) {
                    // 2. Agar user ban gaya, toh hamare public.profiles table me data insert karo
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                full_name: fullName,
                                preferred_gender: gender,
                            },
                        ]);

                    if (profileError) throw profileError;
                    
                    setMessage({ type: 'success', text: 'Signup Successful! Please check your email for confirmation or try logging in.' });
                }
            } else {
                // 3. Login Process
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                if (data?.session) {
                    console.log("--- SUPABASE JWT TOKEN ---");
                    console.log(data.session.access_token);
                    console.log("--------------------------");
                    
                    setMessage({ type: 'success', text: 'Logged in successfully!' });
                    
                    // Token ko local storage me save krletay hain taake refresh pr urr na jaye
                    localStorage.setItem('vfit_token', data.session.access_token);
                    
                    // Parent component ko batane k liye k login ho gya hai
                    if (onAuthSuccess) onAuthSuccess(data.session.access_token);
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
            if (error) throw error;
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isSignup ? 'Create VFit Account' : 'Welcome to VFit'}</h2>
                {message.text && (
                    <div className={`auth-message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleAuth}>
                    {isSignup && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Preferred Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
                    </button>
                    <button
                        type="button"
                        className="google-btn"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="18px"
                            height="18px"
                            viewBox="0 0 48 48"
                            style={{ marginRight: '12px', display: 'block' }}
                            aria-hidden="true"
                        >
                            <g>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.87h12.66c-.54 2.89-2.18 5.33-4.64 6.99l7.21 5.58C43.46 36.27 46.5 30.63 46.5 24z" />
                                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.21-5.58c-2.11 1.41-4.81 2.32-8.68 2.32-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </g>
                        </svg>
                        <span>Sign in with Google</span>
                    </button>
                </form>
                <p className="auth-toggle" onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </p>
            </div>
        </div>
    );
};

export default Auth;