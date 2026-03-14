import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Plus, Pencil, User, CreditCard, Phone } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import './MyBracelet.css';

const MyBracelet = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [step, setStep] = useState('add'); // 'add' or 'confirm'
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        braceletName: '',
        serialNumber: '',
        emergencyName: '',
        emergencyNumber: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => setStep('confirm');
    const handleBack = () => {
        if (step === 'confirm') setStep('add');
        else navigate(-1); // Go back to previous page
    };

    const handleRegister = async () => {
        if (!formData.braceletName || !formData.serialNumber || !formData.emergencyName || !formData.emergencyNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Check if Serial Number already exists
            const q = query(collection(db, 'braceletUsers'), where('serialNumber', '==', formData.serialNumber));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                alert("A bracelet with this Serial Number is already registered.");
                setIsSubmitting(false);
                return;
            }

            // 2. Create the braceletUser document
            // If the user already has an Account photo, use it, otherwise use a fallback
            const finalAvatar = currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.braceletName}`;

            const newBraceletUser = {
                name: formData.braceletName,
                serialNumber: formData.serialNumber,
                ownerAppUserId: currentUser.uid, // The person registering IS the owner
                emergencyContacts: [{
                    name: formData.emergencyName,
                    contactNo: formData.emergencyNumber
                }],
                avatar: finalAvatar,
            };

            const docRef = await addDoc(collection(db, 'braceletUsers'), newBraceletUser);

            // 3. Create initial deviceStatus document
            const deviceData = {
                battery: 100,
                isBraceletOn: true,
                lastSeen: serverTimestamp(),
                location: [0, 0], // Default location, will be updated by the actual device
                pulseRate: null,
                sos: { active: false, timestamp: null },
                userId: docRef.id,
            };

            await addDoc(collection(db, 'deviceStatus'), deviceData);

            alert("Bracelet Registered Successfully!");
            navigate('/app', { state: { openProfile: true } });

        } catch (error) {
            console.error("Error registering bracelet:", error);
            alert("Failed to register bracelet. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isConfirm = step === 'confirm';

    return (
        <div className="br-page">
            <header className="br-navbar">
                <button className="br-nav-back" onClick={handleBack}>
                    <ChevronLeft size={24} color="#444" />
                </button>
                <h1 className="br-nav-title">
                    {isConfirm ? "Confirm User Details" : "Add Bracelet User"}
                </h1>
                <div className="br-nav-spacer"></div>
            </header>

            <main className="br-main">
                <div className="br-form-container">
                    {/* Bracelet Information Section */}
                    <div className="br-section">
                        <div className="br-section-header">
                            <h2 className="br-section-title">
                                <span className="br-indicator"></span>
                                BRACELET CONFIGURATION
                            </h2>
                            {isConfirm && <button className="br-edit-link" onClick={() => setStep('add')}>Edit</button>}
                        </div>

                        <div className="br-field">
                            <label className="br-label">Name of Bracelet {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <User size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="braceletName"
                                    placeholder="Enter bracelet name"
                                    value={formData.braceletName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="br-field">
                            <label className="br-label">Bracelet Serial Number {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <CreditCard size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="serialNumber"
                                    placeholder="Enter serial number"
                                    value={formData.serialNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            <p className="br-hint">You can find the serial number on the back of the bracelet</p>
                        </div>
                    </div>

                    {/* Emergency Contact Section */}
                    <div className="br-section">
                        <div className="br-section-header">
                            <h2 className="br-section-title">
                                <span className="br-indicator"></span>
                                EMERGENCY CONTACT
                            </h2>
                            {isConfirm && <button className="br-edit-link" onClick={() => setStep('add')}>Edit</button>}
                        </div>

                        <div className="br-field">
                            <label className="br-label">Name {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <User size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="emergencyName"
                                    placeholder="Enter contact name"
                                    value={formData.emergencyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="br-field">
                            <label className="br-label">Contact Number {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <CreditCard size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="emergencyNumber"
                                    placeholder="Enter contact number"
                                    value={formData.emergencyNumber}
                                    onChange={handleChange}
                                />
                            </div>
                            {isConfirm && <p className="br-hint br-hint-center">Please make sure the information is correct before proceeding</p>}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="br-footer">
                <button className="br-btn-secondary" onClick={() => navigate('/app')}>Cancel</button>
                {isConfirm ? (
                    <button className="br-btn-primary" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? 'Registering...' : 'Confirm & Save'}
                    </button>
                ) : (
                    <button className="br-btn-primary" onClick={handleNext}>Next</button>
                )}
            </footer>
        </div>
    );
};

export default MyBracelet;
