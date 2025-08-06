import React, { useState } from 'react';
import { User, Bell, Shield, Save, AlertCircle, CheckCircle, MapPin, Phone, Globe, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/DashboardSidebar';
import Topbar from '../components/DashboardTopbar';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles, getStatusStyles, getCardStyles } from '../styles/styleUtils';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };





const Settings = () => {
  const { user, loading, error, clearError, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    university: user?.university || '',
    domain: user?.domain || '',
    scholarLink: user?.scholarLink || '',
    githubLink: user?.githubLink || '',
    keywords: user?.keywords || [],
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    linkedinLink: user?.linkedinLink || '',
    researchInterests: user?.researchInterests || '',
    currentPosition: user?.currentPosition || '',
    yearsOfExperience: user?.yearsOfExperience || 0,
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    collaborationRequests: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Update form data when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        university: user.university || '',
        domain: user.domain || '',
        scholarLink: user.scholarLink || '',
        githubLink: user.githubLink || '',
        keywords: user.keywords || [],
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        linkedinLink: user.linkedinLink || '',
        researchInterests: user.researchInterests || '',
        currentPosition: user.currentPosition || '',
        yearsOfExperience: user.yearsOfExperience || 0,
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle keyword management
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    clearError();

    try {
      const result = await updateUser(formData);
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), );
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const settingsSections = [
    {
      title: 'Profile Information',
      icon: User,
      settings: [
        {
          id: 'bio',
          label: 'Bio',
          description: 'Brief description about yourself',
          type: 'textarea',
          name: 'bio',
          value: formData.bio,
          placeholder: 'Tell us about yourself...'
        },
        {
          id: 'phone',
          label: 'Phone Number',
          description: 'Your contact phone number',
          type: 'input',
          name: 'phone',
          value: formData.phone,
          placeholder: '+1 (555) 123-4567'
        },
        {
          id: 'location',
          label: 'Location',
          description: 'Your current location',
          type: 'input',
          name: 'location',
          value: formData.location,
          placeholder: 'City, Country'
        },
        {
          id: 'website',
          label: 'Personal Website',
          description: 'Your personal or professional website',
          type: 'input',
          name: 'website',
          value: formData.website,
          placeholder: 'https://yourwebsite.com'
        }
      ]
    },
    {
      title: 'Academic Information',
      icon: Briefcase,
      settings: [
        {
          id: 'university',
          label: 'University',
          description: 'Your affiliated university or institution',
          type: 'input',
          name: 'university',
          value: formData.university
        },
        {
          id: 'domain',
          label: 'Research Domain',
          description: 'Your primary research area or field',
          type: 'input',
          name: 'domain',
          value: formData.domain
        },
        {
          id: 'currentPosition',
          label: 'Current Position',
          description: 'Your current academic or professional position',
          type: 'input',
          name: 'currentPosition',
          value: formData.currentPosition,
          placeholder: 'PhD Student, Research Assistant, Professor, etc.'
        },
        {
          id: 'yearsOfExperience',
          label: 'Years of Experience',
          description: 'Years of research or professional experience',
          type: 'input',
          name: 'yearsOfExperience',
          value: formData.yearsOfExperience,
          inputType: 'number',
          placeholder: '0'
        },
        {
          id: 'researchInterests',
          label: 'Research Interests',
          description: 'Detailed description of your research interests',
          type: 'textarea',
          name: 'researchInterests',
          value: formData.researchInterests,
          placeholder: 'Describe your research interests in detail...'
        },
        {
          id: 'keywords',
          label: 'Research Keywords',
          description: 'Keywords that describe your research interests',
          type: 'keywords'
        }
      ]
    },
    {
      title: 'Social Links',
      icon: Globe,
      settings: [
        {
          id: 'scholarLink',
          label: 'Google Scholar Profile',
          description: 'Link to your Google Scholar profile',
          type: 'input',
          name: 'scholarLink',
          value: formData.scholarLink,
          placeholder: 'https://scholar.google.com/citations?user=...'
        },
        {
          id: 'githubLink',
          label: 'GitHub Profile',
          description: 'Link to your GitHub profile',
          type: 'input',
          name: 'githubLink',
          value: formData.githubLink,
          placeholder: 'https://github.com/username'
        },
        {
          id: 'linkedinLink',
          label: 'LinkedIn Profile',
          description: 'Link to your LinkedIn profile',
          type: 'input',
          name: 'linkedinLink',
          value: formData.linkedinLink,
          placeholder: 'https://linkedin.com/in/username'
        }
      ]
    },
  ];

  // Keywords component
  const KeywordsInput = () => (
    <div className="w-64">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="Add keyword..."
          className="flex-1 px-3 py-2 rounded-lg transition-all duration-200"
          style={getInputStyles()}
          onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
          onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
        />
        <button
          onClick={addKeyword}
          className="px-3 py-2 rounded-lg transition-colors"
          style={getButtonStyles('primary')}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData.keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full"
            style={{
              backgroundColor: `${colors.primary.purple[500]}33`, // 20% opacity
              color: colors.primary.purple[300]
            }}
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="transition-colors"
              style={{ color: colors.primary.purple[400] }}
              onMouseEnter={(e) => e.target.style.color = colors.primary.purple[200]}
              onMouseLeave={(e) => e.target.style.color = colors.primary.purple[400]}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: checked ? colors.primary.blue[500] : colors.border.primary
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full transition-transform duration-200"
        style={{
          backgroundColor: colors.text.primary,
          transform: checked ? 'translateX(24px)' : 'translateX(4px)'
        }}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
        <div className="flex h-screen">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col lg:ml-0">
            <Topbar 
              onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
              user={user}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />

            <main className="flex-1 overflow-y-auto p-6">
              <div className="container mx-auto max-w-4xl">
                <div className="animate-pulse">
                  <div className="h-8 rounded w-48 mb-4" style={{ backgroundColor: colors.background.glass }}></div>
                  <div className="h-4 rounded w-96 mb-8" style={{ backgroundColor: colors.background.glass }}></div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-xl p-6 mb-6" style={{ backgroundColor: colors.background.card }}>
                      <div className="h-6 rounded w-32 mb-4" style={{ backgroundColor: colors.background.glass }}></div>
                      <div className="space-y-4">
                        {[1, 2].map(j => (
                          <div key={j} className="rounded-lg p-4" style={{ backgroundColor: colors.background.card }}>
                            <div className="h-4 rounded w-24 mb-2" style={{ backgroundColor: colors.background.glass }}></div>
                            <div className="h-3 rounded w-48" style={{ backgroundColor: colors.background.glass }}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: colors.gradients.background.page }}>
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            user={user}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                Settings
              </h1>
              <p style={{ color: colors.text.secondary }}>
                Manage your account preferences and application settings
              </p>
              {user?.name && (
                <div className="mt-4 p-4 backdrop-blur-lg rounded-lg border" style={{
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.secondary
                }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colors.background.glass }}>
                      <User size={20} style={{ color: colors.primary.blue[400] }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: colors.text.primary }}>Account Name</h3>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>This cannot be changed</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 rounded-lg text-sm" style={{
                        backgroundColor: `${colors.text.disabled}33`, // 20% opacity
                        color: colors.text.secondary
                      }}>
                        {user.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 p-4 border rounded-lg flex items-center gap-3" style={getStatusStyles('error')}>
                <AlertCircle size={20} style={{ color: colors.status.error.text }} />
                <span style={{ color: colors.status.error.text }}>{error}</span>
              </div>
            )}

            {saveStatus === 'success' && (
              <div className="mb-6 p-4 border rounded-lg flex items-center gap-3" style={getStatusStyles('success')}>
                <CheckCircle size={20} style={{ color: colors.status.success.text }} />
                <span style={{ color: colors.status.success.text }}>Settings saved successfully!</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="mb-6 p-4 border rounded-lg flex items-center gap-3" style={getStatusStyles('error')}>
                <AlertCircle size={20} style={{ color: colors.status.error.text }} />
                <span style={{ color: colors.status.error.text }}>Failed to save settings. Please try again.</span>
              </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
              {settingsSections.map((section) => (
                <div
                  key={section.title}
                  className="backdrop-blur-lg rounded-xl p-6 border"
                  style={{
                    backgroundColor: colors.background.card,
                    borderColor: colors.border.secondary
                  }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: colors.background.glass }}>
                      <section.icon size={20} style={{ color: colors.primary.blue[400] }} />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: colors.text.primary }}>
                      {section.title}
                    </h2>
                  </div>

                  {/* Settings Items */}
                  <div className="space-y-4">
                    {section.settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                        style={{
                          backgroundColor: colors.background.card,
                          borderColor: colors.border.light
                        }}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium mb-1" style={{ color: colors.text.primary }}>
                            {setting.label}
                          </h3>
                          <p className="text-sm" style={{ color: colors.text.secondary }}>
                            {setting.description}
                          </p>
                        </div>

                        <div className="ml-4">
                          {setting.type === 'toggle' && (
                            <ToggleSwitch 
                              checked={setting.value} 
                              onChange={setting.onChange}
                            />
                          )}
                          
                          {setting.type === 'input' && (
                            <input
                              type={setting.inputType || "text"}
                              name={setting.name}
                              value={setting.value}
                              onChange={handleInputChange}
                              placeholder={setting.placeholder}
                              className="px-3 py-2 rounded-lg w-64 transition-all duration-200"
                              style={getInputStyles()}
                              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                            />
                          )}
                          
                          {setting.type === 'textarea' && (
                            <textarea
                              name={setting.name}
                              value={setting.value}
                              onChange={handleInputChange}
                              placeholder={setting.placeholder}
                              rows={3}
                              className="px-3 py-2 rounded-lg w-64 resize-vertical transition-all duration-200"
                              style={getInputStyles()}
                              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                            />
                          )}
                          
                          {setting.type === 'keywords' && <KeywordsInput />}
                          
                          {setting.type === 'select' && (
                            <select
                              value={setting.value}
                              onChange={(e) => setting.onChange(e.target.value)}
                              className="px-3 py-2 rounded-lg w-48 transition-all duration-200"
                              style={getInputStyles()}
                              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
                              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
                            >
                              {setting.options?.map((option) => (
                                <option key={option.value} value={option.value} style={{ backgroundColor: colors.background.secondary }}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 font-medium rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={
                  isSaving 
                    ? getButtonStyles('primary', true)
                    : getButtonStyles('primary')
                }
                onMouseEnter={!isSaving ? (e) => {
                  Object.assign(e.target.style, {
                    background: colors.button.primary.backgroundHover,
                    transform: 'scale(1.05)',
                    boxShadow: `0 20px 25px -5px ${colors.shadow.xl}, 0 10px 10px -5px ${colors.shadow.lg}`
                  });
                } : undefined}
                onMouseLeave={!isSaving ? (e) => {
                  Object.assign(e.target.style, {
                    background: colors.button.primary.background,
                    transform: 'scale(1)',
                    boxShadow: `0 10px 15px -3px ${colors.shadow.lg}, 0 4px 6px -2px ${colors.shadow.default}`
                  });
                } : undefined}
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};export default Settings;