import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, User, Phone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import LoadingSpinner from '../../components/LoadingSpinner';
import './MyBracelet.css';

const MyBraceletEmergency = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigured, setIsConfigured] = useState(false);
    const [serialNumber, setSerialNumber] = useState(null);

    const [formData, setFormData] = useState({
        emergencyName: '',
        emergencyNumber: ''
    });

    const [errors, setErrors] = useState({
        emergencyNumber: ''
    });

    const PHONE_NUMBER_REGEX = /^(09\d{9}|\+639\d{9})$/;

    useEffect(() => {
        const fetchOwnedBracelet = async () => {
            if (!currentUser) return;
            try {
                const q = query(
                    collection(db, 'braceletUsers'), 
                    where('ownerAppUserId', '==', currentUser.uid)
                );
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const data = querySnapshot.docs[0].data();
                    const emergency = data.emergencyContacts?.[0] || {};
                    
                    setFormData({
                        emergencyName: emergency.name || '',
                        emergencyNumber: emergency.contactNo || ''
                    });
                    setSerialNumber(data.serialNumber);
                    setIsConfigured(true);
                } else {
                    setIsConfigured(false);
                }
            } catch (err) {
                console.error("Error fetching owned bracelet:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOwnedBracelet();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'emergencyNumber' && errors.emergencyNumber) {
            setErrors(prev => ({ ...prev, emergencyNumber: '' }));
        }
    };

    const validate = () => {
        let newErrors = { emergencyNumber: '' };
        let hasError = false;

        if (!PHONE_NUMBER_REGEX.test(formData.emergencyNumber)) {
            newErrors.emergencyNumber = 'Invalid format. Use 09 or +639 format (e.g., 09123456789)';
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const handleSave = async () => {
        if (!isConfigured || !serialNumber) {
            alert("Please complete the Bracelet Configuration first before adding an Emergency Contact.");
            return;
        }

        if (!formData.emergencyName || !formData.emergencyNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const braceletRef = doc(db, 'braceletUsers', serialNumber);

            await setDoc(braceletRef, {
                emergencyContacts: [{
                    name: formData.emergencyName,
                    contactNo: formData.emergencyNumber
                }]
            }, { merge: true });

            alert("Emergency Contact Updated!");
            
            navigate('/app/my-bracelet');

        } catch (error) {
            console.error("Error updating emergency contact:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="br-page">
                <header className="br-navbar">
                    <button className="br-nav-back" onClick={() => navigate('/app/my-bracelet')}>
                        <ChevronLeft size={24} color="#444" />
                    </button>
                    <h1 className="br-nav-title">Emergency Contact</h1>
                    <div className="br-nav-spacer"></div>
                </header>
                <div className="br-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="br-page">
            <header className="br-navbar">
                <button className="br-nav-back" onClick={() => navigate('/app/my-bracelet')}>
                    <ChevronLeft size={24} color="#444" />
                </button>
                <h1 className="br-nav-title">Emergency Contact</h1>
                <div className="br-nav-spacer"></div>
            </header>

            <main className="br-main" style={{ paddingBottom: '0px' }}>
                <div className="br-form-container">
                    {!isConfigured && (
                        <div style={{ background: '#fff3cd', color: '#856404', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #ffeeba' }}>
                            <AlertTriangle size={24} />
                            <div>
                                <strong>Setup Required</strong>
                                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Please complete the <strong>Bracelet Configuration</strong> first to set your Bracelet Serial Number.</p>
                            </div>
                        </div>
                    )}

                    <div className="br-section">
                        <div className="br-section-header">
                            <h2 className="br-section-title">
                                <span className="br-indicator"></span>
                                EMERGENCY CONTACT
                            </h2>
                        </div>

                        <div className="br-field">
                            <label className="br-label">Name <span className="br-required">*</span></label>
                            <div className="br-input-group">
                                <User size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="emergencyName"
                                    placeholder="Enter contact name"
                                    value={formData.emergencyName}
                                    onChange={handleChange}
                                    disabled={!isConfigured}
                                    required
                                />
                            </div>
                        </div>

                        <div className="br-field">
                            <label className="br-label">Contact Number <span className="br-required">*</span></label>
                            <div className="br-input-group">
                                <Phone size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="emergencyNumber"
                                    placeholder="Enter contact number"
                                    value={formData.emergencyNumber}
                                    onChange={handleChange}
                                    disabled={!isConfigured}
                                    required
                                />
                            </div>
                            {errors.emergencyNumber && <p className="br-error" style={{ margin: '0px' }}>{errors.emergencyNumber}</p>}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="br-footer" >
                <button className="br-btn-secondary" onClick={() => navigate('/app/my-bracelet')}>Cancel</button>
                <button className="br-btn-primary" onClick={handleSave} disabled={isSubmitting || !isConfigured}>
                    {isSubmitting ? 'Saving Changes...' : 'Save Contact'}
                </button>
            </footer>
        </div>
    );
};

export default MyBraceletEmergency;
