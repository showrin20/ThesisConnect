import { useState } from 'react';
import ReactMde from 'react-mde';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';
import 'react-mde/lib/styles/css/react-mde-all.css';
import axios from '../axios';
import { colors } from '../styles/colors';

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
];

export default function Blog() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('write');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', JSON.stringify(tags.map(tag => tag.value)));

      if (featuredImage) {
        formData.append('featuredImage', featuredImage);
      }

      // Add any other fields like category, status if needed:
      // formData.append('category', 'Technology');
      // formData.append('status', 'published');

      const response = await axios.post('/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ Blog posted successfully!');
      console.log(response.data);

      // Reset form
      setTitle('');
      setTags([]);
      setContent('');
      setFeaturedImage(null);
    } catch (error) {
      console.error(error);
      alert('❌ Failed to post blog');
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: colors.gradients.background.page }}
    >
      <div
        className="rounded-xl shadow-xl p-8 w-full max-w-3xl backdrop-blur-lg border"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary,
          boxShadow: `0 20px 40px ${colors.shadow.xl}`
        }}
      >
        <h1
          className="text-3xl font-bold mb-6"
          style={{
            background: colors.gradients.brand.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Create a Blog Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-md shadow-sm transition-all duration-200"
            style={{
              backgroundColor: colors.input.background,
              border: `1px solid ${colors.input.border}`,
              color: colors.text.primary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.input.borderFocus;
              e.target.style.boxShadow = `0 0 0 2px ${colors.input.borderFocus}33`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.input.border;
              e.target.style.boxShadow = 'none';
            }}
          />

          <Select
            isMulti
            options={tagOptions}
            value={tags}
            onChange={setTags}
            placeholder="Select tags..."
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
                  ? colors.primary.purple[500]
                  : state.isFocused
                    ? `${colors.primary.purple[500]}20`
                    : 'transparent',
                color: state.isSelected ? colors.text.primary : colors.text.secondary,
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: `${colors.primary.purple[500]}20`,
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: colors.primary.purple[100],
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                color: colors.primary.purple[400],
                '&:hover': {
                  backgroundColor: colors.primary.purple[500],
                  color: colors.text.primary,
                },
              }),
            }}
          />

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
                color: ${colors.text.primary} !important;
              }
              .react-mde .mde-header button:hover {
                background-color: ${colors.primary.purple[100]}20 !important;
                color: ${colors.primary.purple[100]} !important;
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
              value={content}
              onChange={setContent}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              generateMarkdownPreview={(markdown) =>
                Promise.resolve(<ReactMarkdown>{markdown}</ReactMarkdown>)
              }
              minEditorHeight={250}
            />
          </div>

          <div>
            <label
              htmlFor="featuredImage"
              className="block mb-1 font-semibold"
              style={{ color: colors.text.primary }}
            >
              Featured Image (optional)
            </label>
            <input
              id="featuredImage"
              type="file"
              accept="image/*"
              onChange={e => setFeaturedImage(e.target.files[0])}
              className="w-full"
            />
            {featuredImage && (
              <p className="mt-2 text-sm text-green-600">
                Selected file: {featuredImage.name}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: colors.gradients.brand.primary,
              color: colors.text.primary,
              border: 'none',
              boxShadow: `0 4px 15px ${colors.shadow.lg}`,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = colors.gradients.brand.secondary;
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = `0 8px 25px ${colors.shadow.xl}`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = colors.gradients.brand.primary;
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 4px 15px ${colors.shadow.lg}`;
              }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Blog'}
          </button>
        </form>
      </div>
    </div>
  );
}
