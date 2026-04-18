import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Wallet, Zap, CreditCard, Eye, EyeOff, X, Smartphone, Building } from 'lucide-react';
import { doc, getDocs, updateDoc, collection, query, where } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MyBracelet.css';

const MyBraceletLoad = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [balance, setBalance] = useState(0);
    const [serialNumber, setSerialNumber] = useState('');
    const [loadAmount, setLoadAmount] = useState('');
    const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
    const [showBalance, setShowBalance] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const QUICK_AMOUNTS = [100, 200, 500, 1000];

    useEffect(() => {
        const fetchBalance = async () => {
            if (!currentUser) return;
            try {
                const q = query(
                    collection(db, 'braceletUsers'), 
                    where('ownerAppUserId', '==', currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    setBalance(data.balance || 0);
                    setSerialNumber(data.serialNumber);
                }
            } catch (err) {
                console.error("Error fetching balance:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalance();
    }, [currentUser]);

    const handleAmountChange = (e) => {
        setLoadAmount(e.target.value);
        setSelectedQuickAmount(null);
    };

    const handleQuickSelect = (amount) => {
        setLoadAmount(amount.toString());
        setSelectedQuickAmount(amount);
    };

    const handleReloadClick = () => {
        const amountToAdd = parseFloat(loadAmount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            alert("Please enter a valid amount to load.");
            return;
        }

        if (!serialNumber) {
            alert("No registered bracelet found. Please configure your bracelet first.");
            return;
        }

        setShowPaymentModal(true);
    };

    const processPayment = async (method) => {
        setShowPaymentModal(false);
        setIsSubmitting(true);
        const amountToAdd = parseFloat(loadAmount);
        
        // Simulate payment gateway processing time
        setTimeout(async () => {
            try {
                const newBalance = balance + amountToAdd;
                const braceletRef = doc(db, 'braceletUsers', serialNumber);
                await updateDoc(braceletRef, {
                    balance: newBalance
                });
                setBalance(newBalance);
                setLoadAmount('');
                setSelectedQuickAmount(null);
                alert(`Successfully loaded ₱${amountToAdd.toFixed(2)} via ${method}. New Balance: ₱${newBalance.toFixed(2)}`);
            } catch (err) {
                console.error("Error updating balance:", err);
                alert("Transaction failed. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }, 1500); 
    };

    return (
        <div className="br-page">
            {showPaymentModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '400px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Select Payment Method</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                                <X size={24} color="#666" />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>Amount to pay: <strong style={{ color: '#a4262c', fontSize: '16px' }}>₱{parseFloat(loadAmount).toFixed(2)}</strong></p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button onClick={() => processPayment('GCash')} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', cursor: 'pointer', gap: '12px', transition: 'background 0.2s' }}>
                                    <div style={{ background: 'rgba(0, 106, 255, 0.1)', color: '#006aff', padding: '8px', borderRadius: '8px', display: 'flex' }}><Smartphone size={20} /></div>
                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>GCash</span>
                                </button>
                                <button onClick={() => processPayment('Maya')} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', cursor: 'pointer', gap: '12px', transition: 'background 0.2s' }}>
                                    <div style={{ background: 'rgba(20, 20, 20, 0.1)', color: '#141414', padding: '8px', borderRadius: '8px', display: 'flex' }}><Smartphone size={20} /></div>
                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>Maya</span>
                                </button>
                                <button onClick={() => processPayment('Credit / Debit Card')} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', cursor: 'pointer', gap: '12px', transition: 'background 0.2s' }}>
                                    <div style={{ background: 'rgba(164, 38, 44, 0.1)', color: '#a4262c', padding: '8px', borderRadius: '8px', display: 'flex' }}><CreditCard size={20} /></div>
                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>Credit / Debit Card</span>
                                </button>
                                <button onClick={() => processPayment('Bank Transfer')} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #eee', background: '#fcfcfc', cursor: 'pointer', gap: '12px', transition: 'background 0.2s' }}>
                                    <div style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', padding: '8px', borderRadius: '8px', display: 'flex' }}><Building size={20} /></div>
                                    <span style={{ fontWeight: '600', color: '#333', fontSize: '15px' }}>Bank Transfer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <header className="br-navbar">
                <button className="br-nav-back" onClick={() => navigate('/app/my-bracelet')}>
                    <ChevronLeft size={24} color="#444" />
                </button>
                <h1 className="br-nav-title">Load & Balance</h1>
                <div className="br-nav-spacer"></div>
            </header>

            {isLoading ? (
                <div className="br-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
            ) : (
                <main className="br-main" style={{ paddingBottom: '0px' }}>
                    <div className="br-form-container">
                        
                        {/* Current Balance Card */}
                        <div className="br-section" style={{ 
                            background: 'linear-gradient(135deg, rgba(164,38,44,0.05), rgba(164,38,44,0.15))',
                            border: '1px solid rgba(164,38,44,0.2)',
                            textAlign: 'center',
                            padding: '32px 20px'
                        }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 12px rgba(164,38,44,0.15)', marginBottom: '16px' }}>
                                <Wallet size={28} color="#a4262c" />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</h3>
                                <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'color 0.2s ease' }}>
                                    {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                            <div style={{ fontSize: '42px', fontWeight: '800', color: '#a4262c', lineHeight: '1' }}>
                                {showBalance ? `₱${balance.toFixed(2)}` : '₱ ••••'}
                            </div>
                        </div>

                        {/* Top-up Section */}
                        <div className="br-section">
                            <div className="br-section-header">
                                <h2 className="br-section-title">
                                    <span className="br-indicator"></span>
                                    TOP-UP BRACELET
                                </h2>
                            </div>

                            <div className="br-field" style={{ marginBottom: '24px' }}>
                                <label className="br-label">Custom Amount</label>
                                <div className="br-input-group">
                                    <span style={{ padding: '0 0 0 12px', color: '#a4262c', fontWeight: 'bold' }}>₱</span>
                                    <input
                                        className="br-input"
                                        type="number"
                                        placeholder="Enter amount (e.g. 150)"
                                        value={loadAmount}
                                        onChange={handleAmountChange}
                                        min="1"
                                        style={{ paddingLeft: '8px' }}
                                    />
                                </div>
                            </div>

                            <div className="br-field">
                                <label className="br-label">Quick Select</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {QUICK_AMOUNTS.map(amount => (
                                        <button 
                                            key={amount}
                                            onClick={() => handleQuickSelect(amount)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: selectedQuickAmount === amount ? '2px solid #a4262c' : '1px solid #ddd',
                                                background: selectedQuickAmount === amount ? 'rgba(164,38,44,0.05)' : '#fff',
                                                color: selectedQuickAmount === amount ? '#a4262c' : '#444',
                                                fontWeight: '600',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <Zap size={16} /> ₱{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            )}

            <footer className="br-footer">
                <button 
                    className="br-btn-primary" 
                    onClick={handleReloadClick} 
                    disabled={isSubmitting || isLoading || !loadAmount}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (isSubmitting || isLoading || !loadAmount) ? 0.6 : 1 }}
                >
                    <CreditCard size={20} />
                    {isSubmitting ? 'Processing...' : 'Reload Now'}
                </button>
            </footer>
        </div>
    );
};

export default MyBraceletLoad;
