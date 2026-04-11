import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Wallet, Zap, CreditCard } from 'lucide-react';
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

    const handleReload = async () => {
        const amountToAdd = parseFloat(loadAmount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            alert("Please enter a valid amount to load.");
            return;
        }

        if (!serialNumber) {
            alert("No registered bracelet found. Please configure your bracelet first.");
            return;
        }

        setIsSubmitting(true);
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
                alert(`Successfully loaded ₱${amountToAdd}. New Balance: ₱${newBalance.toFixed(2)}`);
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
                            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</h3>
                            <div style={{ fontSize: '42px', fontWeight: '800', color: '#a4262c', lineHeight: '1' }}>
                                ₱{balance.toFixed(2)}
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
                    onClick={handleReload} 
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
