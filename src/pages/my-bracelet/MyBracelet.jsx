import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, User, CreditCard, Phone, CheckCircle2 } from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
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

    const [originalSerial, setOriginalSerial] = useState('');

    const [errors, setErrors] = useState({
        serialNumber: '',
        emergencyNumber: ''
    });

    const SERIAL_NUMBER_REGEX = /^PM-\d{4}-\d{3,5}$/;
    const PHONE_NUMBER_REGEX = /^(09\d{9}|\+639\d{9})$/;

    React.useEffect(() => {
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
                        braceletName: data.name || '',
                        serialNumber: data.serialNumber || '',
                        emergencyName: emergency.name || '',
                        emergencyNumber: emergency.contactNo || ''
                    });
                    setOriginalSerial(data.serialNumber || '');
                    setIsAlreadyConfigured(true);
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
        
        // Clear error when user starts typing
        if (name === 'serialNumber' && errors.serialNumber) {
            setErrors(prev => ({ ...prev, serialNumber: '' }));
        }
        if (name === 'emergencyNumber' && errors.emergencyNumber) {
            setErrors(prev => ({ ...prev, emergencyNumber: '' }));
        }
    };

    const validate = () => {
        let newErrors = { serialNumber: '', emergencyNumber: '' };
        let hasError = false;

        // Validate Serial Number
        if (!SERIAL_NUMBER_REGEX.test(formData.serialNumber)) {
            newErrors.serialNumber = 'Invalid format. Use PM-YYYY-XXX (e.g., PM-2026-001)';
            hasError = true;
        }

        // Validate Phone Number
        if (!PHONE_NUMBER_REGEX.test(formData.emergencyNumber)) {
            newErrors.emergencyNumber = 'Invalid format. Use 09 or +639 format (e.g., 09123456789)';
            hasError = true;
        }

        setErrors(newErrors);
        return !hasError;
    };

    const handleNext = () => {
        if (validate()) {
            setStep('confirm');
        }
    };

    const handleBack = () => {
        if (step === 'confirm') setStep('add');
        else navigate(-1);
    };

    const handleRegister = async () => {
        if (!formData.braceletName || !formData.serialNumber || !formData.emergencyName || !formData.emergencyNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        // Enterprise Standard Validation before saving
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const serial = formData.serialNumber.trim();
            const braceletRef = doc(db, 'braceletUsers', serial);
            
            const hasSerialChanged = isAlreadyConfigured && serial !== originalSerial;
            
            if (!isAlreadyConfigured || hasSerialChanged) {
                // Check if the NEW Serial Number is available
                const existingDoc = await getDoc(braceletRef);
                if (existingDoc.exists()) {
                    alert("A bracelet with this Serial Number is already registered by another user.");
                    setIsSubmitting(false);
                    return;
                }
            }

            const avatarURL = currentUser?.photoURL || null;

            // Update or Create braceletUsers document with merge to avoid data destruction
            await setDoc(braceletRef, {
                name: formData.braceletName,
                serialNumber: serial,
                ownerAppUserId: currentUser.uid,
                emergencyContacts: [{
                    name: formData.emergencyName,
                    contactNo: formData.emergencyNumber
                }],
                avatar: avatarURL,
            }, { merge: true });

            if (!isAlreadyConfigured) {
                // ADD MODE: Create deviceStatus document only if new
                const deviceRef = doc(db, 'deviceStatus', serial);
                await setDoc(deviceRef, {
                    battery: 100,
                    isBraceletOn: true,
                    lastSeen: serverTimestamp(),
                    location: {
                        latitude: 0,
                        longitude: 0,
                        updatedAt: serverTimestamp()
                    },
                    sos: { active: false, timestamp: null },
                });
                alert("Bracelet Registered Successfully!");
            } else {
                if (hasSerialChanged) {
                    // Cleanup the old records if the Serial Number was moved
                    await deleteDoc(doc(db, 'braceletUsers', originalSerial));
                    await deleteDoc(doc(db, 'deviceStatus', originalSerial));
                    setOriginalSerial(serial);
                    alert("Serial Number Updated and Migrated Successfully!");
                } else {
                    alert("Bracelet Configuration Updated!");
                }
            }
            
            navigate('/app', { state: { openProfile: true } });

        } catch (error) {
            console.error("Error registering/updating bracelet:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isConfirm = step === 'confirm' && !isAlreadyConfigured;

    return (
        <div className="br-page">
            <header className="br-navbar">
                <button className="br-nav-back" onClick={handleBack}>
                    <ChevronLeft size={24} color="#444" />
                </button>
                <h1 className="br-nav-title">
                    {isAlreadyConfigured ? "Edit Bracelet" : (isConfirm ? "Confirm Details" : "Register My Bracelet")}
                </h1>
                <div className="br-nav-spacer"></div>
            </header>

            {isLoading ? (
                <div className="br-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
            ) : (
                <main className="br-main" style={{ paddingBottom: '0px' }}>
                    <div className="br-form-container">
                        {/* Bracelet Information Section */}
                        <div className="br-section">
                            <div className="br-section-header">
                                <h2 className="br-section-title">
                                    <span className="br-indicator"></span>
                                    {isAlreadyConfigured ? "CURRENT CONFIGURATION" : "BRACELET CONFIGURATION"}
                                </h2>
                                {isAlreadyConfigured && !isConfirm && (
                                    <div className="br-configured-badge">
                                        <CheckCircle2 size={18} className='circle-icon'/> Already Configured
                                    </div>
                                )}
                                {isConfirm && <button className="br-edit-link" style={{ padding: '0px' }} onClick={() => setStep('add')}>Edit</button>}
                            </div>

                        <div className="br-field">
                            <label className="br-label">Name of Bracelet User {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <User size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="braceletName"
                                    placeholder="Enter your name"
                                    value={formData.braceletName}
                                    onChange={handleChange}
                                    disabled={isConfirm}
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
                                    placeholder="PM-YYYY-XXX"
                                    value={formData.serialNumber}
                                    onChange={handleChange}
                                    disabled={isConfirm}
                                />
                            </div>
                            {errors.serialNumber && <p className="br-error" style={{ margin: '0px' }}>{errors.serialNumber}</p>}
                            <p className="br-hint" style={{ margin: '0px' }}>You can find the serial number on the back of the bracelet</p>
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
                                    disabled={isConfirm}
                                />
                            </div>
                        </div>

                        <div className="br-field">
                            <label className="br-label">Contact Number {!isConfirm && <span className="br-required">*</span>}</label>
                            <div className="br-input-group">
                                <Phone size={18} className="br-icon" />
                                <input
                                    className="br-input"
                                    type="text"
                                    name="emergencyNumber"
                                    placeholder="Enter contact number"
                                    value={formData.emergencyNumber}
                                    onChange={handleChange}
                                    disabled={isConfirm}
                                />
                            </div>
                            {errors.emergencyNumber && <p className="br-error" style={{ margin: '0px' }}>{errors.emergencyNumber}</p>}
                        </div>
                    </div>
                </div>
                </main>
            )}
            {isConfirm && <p className="br-hint br-hint-center" style={{ margin: '0px' }}>Please make sure the information is correct before proceeding</p>}
            <footer className="br-footer" >
                <button className="br-btn-secondary" onClick={() => navigate('/app')}>Cancel</button>
                {isAlreadyConfigured ? (
                    <button className="br-btn-primary" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                ) : isConfirm ? (
                    <button className="br-btn-primary" onClick={handleRegister} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving Changes...' : 'Confirm & Save'}
                    </button>
                ) : (
                    <button className="br-btn-primary" onClick={handleNext}>Next</button>
                )}
            </footer>
        </div>
    );
};

export default MyBracelet;
