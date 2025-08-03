import React, { useState } from 'react';
import { User, Bell, Shield, Save, AlertCircle, CheckCircle, MapPin, Phone, Globe, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/DashboardSidebar';

const Settings = () => {
  const { user, loading, error, clearError, updateUser } = useAuth();
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
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
        />
        <button
          onClick={addKeyword}
          className="px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData.keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
          >
            {keyword}
            <button
              onClick={() => removeKeyword(keyword)}
              className="text-purple-400 hover:text-purple-200"
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
        checked 
          ? 'bg-sky-500' 
          : 'bg-gray-600'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-48 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-96 mb-8"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-6 mb-6">
                <div className="h-6 bg-white/10 rounded w-32 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2].map(j => (
                    <div key={j} className="bg-white/5 rounded-lg p-4">
                      <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-white/10 rounded w-48"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-slate-900 to-blue-900/20">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 ml-10"> {/* Changed from ml-64 to ml-16 */}
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Settings
              </h1>
              <p className="text-white/70">
                Manage your account preferences and application settings
              </p>
              {user?.name && (
                <div className="mt-4 p-4 bg-white/5 backdrop-blur-lg rounded-lg border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                      <User size={20} className="text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Account Name</h3>
                      <p className="text-white/70 text-sm">This cannot be changed</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-lg text-sm">
                        {user.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {saveStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-400" size={20} />
                <span className="text-green-300">Settings saved successfully!</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-400" size={20} />
                <span className="text-red-300">Failed to save settings. Please try again.</span>
              </div>
            )}

            {/* Settings Sections */}
            <div className="space-y-6">
              {settingsSections.map((section) => (
                <div
                  key={section.title}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/10">
                      <section.icon size={20} className="text-sky-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {section.title}
                    </h2>
                  </div>

                  {/* Settings Items */}
                  <div className="space-y-4">
                    {section.settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">
                            {setting.label}
                          </h3>
                          <p className="text-sm text-white/70">
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
                              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50 w-64"
                            />
                          )}
                          
                          {setting.type === 'textarea' && (
                            <textarea
                              name={setting.name}
                              value={setting.value}
                              onChange={handleInputChange}
                              placeholder={setting.placeholder}
                              rows={3}
                              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50 w-64 resize-vertical"
                            />
                          )}
                          
                          {setting.type === 'keywords' && <KeywordsInput />}
                          
                          {setting.type === 'select' && (
                            <select
                              value={setting.value}
                              onChange={(e) => setting.onChange(e.target.value)}
                              className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50 w-48"
                            >
                              {setting.options?.map((option) => (
                                <option key={option.value} value={option.value} className="bg-slate-800">
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;