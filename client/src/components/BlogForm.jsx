import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import CreatableSelect from 'react-select/creatable';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { BookOpen, X, FileText } from 'lucide-react';
import { colors } from '../styles/colors';
import { getInputStyles, getButtonStyles } from '../styles/styleUtils';

const tagOptions = [
  { value: 'AI', label: 'AI' },
  { value: 'ML', label: 'Machine Learning' },
  { value: 'Thesis', label: 'Thesis' },
  { value: 'Research', label: 'Research' },
  { value: 'Collaboration', label: 'Collaboration' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Academia', label: 'Academia' },
  { value: 'Tutorial', label: 'Tutorial' },
  { value: 'Opinion', label: 'Opinion' },
  { value: 'News', label: 'News' },
  { value: 'Review', label: 'Review' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Other', label: 'Other' },
]

const categories = [
  'Research',
  'Technology',
  'Academia',
  'Tutorial',
  'Opinion',
  'News',
  'Review',
  'Personal',
];

export default function BlogForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  error,
  success,
  loading,
}) {
  const [selectedTab, setSelectedTab] = useState('write');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Sync tags from formData to selectedTags on mount and formData.tags change
  useEffect(() => {
    if (formData.tags) {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const tagObjects = tags.map((tag) => {
        const existingOption = tagOptions.find((option) => option.value === tag);
        return existingOption || { value: tag, label: tag };
      });
      setSelectedTags(tagObjects);
    } else {
      setSelectedTags([]);
    }
  }, [formData.tags]);

  // Sync featuredImage from formData if needed (optional)
  useEffect(() => {
    if (formData.featuredImage instanceof File) {
      setSelectedImage(formData.featuredImage);
    } else if (typeof formData.featuredImage === 'string' && formData.featuredImage) {
      // If it's a URL string, could show preview or skip
      setSelectedImage(null);
    } else {
      setSelectedImage(null);
    }
  }, [formData.featuredImage]);

  // Helper to check form validity
  const isFormValid = () =>
    formData.title?.trim() &&
    formData.content?.trim() &&
    formData.excerpt?.trim() &&
    formData.category?.trim();

  // Centralized input change handler to normalize event structure
  const handleChange = (eOrValue) => {
    if (!onChange) return;

    // Handle React Select change (passes array of selected tags)
    if (Array.isArray(eOrValue)) {
      const tagString = eOrValue.map((tag) => tag.value).join(', ');
      onChange({ target: { name: 'tags', value: tagString } });
      setSelectedTags(eOrValue);
      return;
    }

    // Handle ReactMde markdown content changes (just value)
    if (typeof eOrValue === 'string') {
      onChange({ target: { name: 'content', value: eOrValue } });
      return;
    }

    // Handle synthetic/native events
    const { name, value, files } = eOrValue.target;

    if (name === 'featuredImage' && files) {
      const file = files[0];
      if (file) {
        // Validate image file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file');
          return;
        }
        // Validate max size 5MB
        if (file.size > 5 * 1024 * 1024) {
          alert('Image file size must be less than 5MB');
          return;
        }
        setSelectedImage(file);
        onChange({ target: { name, value: file, files: [file] } });
      } else {
        setSelectedImage(null);
        onChange({ target: { name, value: null, files: [] } });
      }
      return;
    }

    // Normal text, textarea, select inputs
    onChange({ target: { name, value } });
  };

  // Remove image handler
  const removeImage = () => {
    setSelectedImage(null);
    onChange({ target: { name: 'featuredImage', value: null, files: [] } });
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: `${colors.status.error.background}33`,
            borderColor: colors.status.error.background,
            color: colors.status.error.text,
          }}
          role="alert"
        >
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div
          className="mb-6 p-4 rounded-lg border"
          style={{
            backgroundColor: `${colors.status.success.background}33`,
            borderColor: colors.status.success.background,
            color: colors.status.success.text,
          }}
          role="status"
        >
          <p className="font-medium">Success!</p>
          <p className="text-sm mt-1">Blog post {isEditing ? 'updated' : 'created'} successfully.</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6" encType="multipart/form-data" noValidate>
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Blog Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title || ''}
            onChange={handleChange}
            placeholder="Enter an engaging title for your blog post"
            required
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            autoComplete="off"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt || ''}
            onChange={handleChange}
            placeholder="Brief summary of your blog post (will be shown in previews)"
            required
            rows={3}
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          />
        </div>

        {/* Content with Markdown Editor */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Content * (Markdown supported)
          </label>
          <div
            className="rounded-lg overflow-hidden border"
            style={{
              borderColor: colors.border.secondary,
              backgroundColor: colors.input.background,
            }}
          >
            <style>{`
              .react-mde .mde-header {
                background-color: ${colors.background.card} !important;
                border-bottom: 1px solid ${colors.border.secondary} !important;
              }
              .react-mde .mde-header button {
                color: ${colors.text.secondary} !important;
              }
              .react-mde .mde-header button:hover {
                background-color: ${colors.primary.blue[500]}20 !important;
                color: ${colors.primary.blue[400]} !important;
              }
              .react-mde .mde-text {
                background-color: ${colors.input.background} !important;
                color: ${colors.text.primary} !important;
                border: none !important;
              }
              .react-mde .mde-text:focus {
                outline: none !important;
                box-shadow: 0 0 0 2px ${colors.input.borderFocus}33 !important;
              }
              .react-mde .mde-preview .mde-preview-content {
                background-color: ${colors.background.card} !important;
                color: ${colors.text.primary} !important;
              }
            `}</style>
            <ReactMde
              value={formData.content || ''}
              onChange={(value) => handleChange(value)}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              generateMarkdownPreview={(markdown) =>
                Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
              }
              minEditorHeight={200}
              heightUnits="px"
            />
          </div>
        </div>

        {/* Category and Read Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="readTime"
              className="block text-sm font-medium mb-2"
              style={{ color: colors.text.secondary }}
            >
              Read Time (minutes)
            </label>
            <input
              id="readTime"
              name="readTime"
              type="number"
              value={formData.readTime || ''}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="1"
              max="60"
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
              onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
              onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
            />
          </div>
        </div>

        {/* Tags with Creatable Select */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Tags
          </label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={(selected) => handleChange(selected || [])}
            placeholder="Select or type tags..."
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: colors.input.background,
                borderColor: state.isFocused ? colors.input.borderFocus : colors.input.border,
                boxShadow: state.isFocused ? `0 0 0 2px ${colors.input.borderFocus}33` : 'none',
                '&:hover': {
                  borderColor: colors.input.borderFocus,
                },
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: colors.background.card,
                border: `1px solid ${colors.border.secondary}`,
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? colors.primary.blue[500]
                  : state.isFocused
                  ? `${colors.primary.blue[500]}20`
                  : 'transparent',
                color: state.isSelected ? colors.text.primary : colors.text.secondary,
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: `${colors.primary.blue[500]}20`,
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: colors.primary.blue[400],
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: colors.primary.blue[400],
                '&:hover': {
                  backgroundColor: colors.primary.blue[500],
                  color: colors.text.primary,
                },
              }),
            }}
          />
          <p className="text-xs mt-1" style={{ color: colors.text.muted }}>
            Select from existing tags or create new ones
          </p>
        </div>

        {/* Featured Image */}
        {/* <div>
          <label
            htmlFor="featuredImage"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Featured Image
          </label>
          <div className="space-y-3">
            <input
              id="featuredImage"
              name="featuredImage"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 rounded-lg transition-all duration-200"
              style={getInputStyles()}
            />

            {selectedImage && (
              <div
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{
                  backgroundColor: `${colors.primary.blue[500]}1A`,
                  borderColor: `${colors.primary.blue[500]}4D`,
                }}
              >
                <div className="flex items-center space-x-3">
                  <FileText size={20} style={{ color: colors.primary.blue[400] }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                      {selectedImage.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.text.muted }}>
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1 rounded transition-colors"
                  style={{ color: colors.status.error.text }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = `${colors.status.error.background}33`)
                  }
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                  aria-label="Remove selected image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div> */}

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium mb-2"
            style={{ color: colors.text.secondary }}
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'draft'}
            onChange={handleChange}
            className="w-full p-3 rounded-lg transition-all duration-200"
            style={getInputStyles()}
            onFocus={(e) => Object.assign(e.target.style, getInputStyles(true))}
            onBlur={(e) => Object.assign(e.target.style, getInputStyles(false))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex justify-between">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={getButtonStyles('outline')}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, getButtonStyles('outline'), {
                  backgroundColor: colors.button.outline.backgroundHover,
                })
              }
              onMouseLeave={(e) => Object.assign(e.target.style, getButtonStyles('outline'))}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="px-8 py-3 rounded-lg font-medium transition-all duration-200"
            style={
              loading || !isFormValid()
                ? getButtonStyles('primary', true)
                : getButtonStyles('primary')
            }
            onMouseEnter={
              !loading && isFormValid()
                ? (e) => {
                    Object.assign(e.target.style, {
                      background: colors.button.primary.backgroundHover,
                      transform: 'scale(1.02)',
                    });
                  }
                : undefined
            }
            onMouseLeave={
              !loading && isFormValid()
                ? (e) => {
                    Object.assign(e.target.style, {
                      background: colors.button.primary.background,
                      transform: 'scale(1)',
                    });
                  }
                : undefined
            }
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: `${colors.button.primary.text}4D`,
                    borderTopColor: colors.button.primary.text,
                  }}
                />
                <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <BookOpen size={18} />
                <span>{isEditing ? 'Update Blog Post' : 'Create Blog Post'}</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

BlogForm.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    category: PropTypes.string,
    readTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tags: PropTypes.string,
    featuredImage: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(File)]),
    status: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isEditing: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.bool,
  loading: PropTypes.bool,
};
