import React from 'react';
import { ExternalLink } from 'lucide-react';
import { colors } from '../styles/colors';

const PublicationCard = ({
  title,
  authors,
  year,
  venue,
  tags,
  doi,
  abstract,
}) => {
  // Format authors nicely if array, else string
  const formattedAuthors = Array.isArray(authors)
    ? authors.join(', ')
    : authors;

  // Shorten abstract to ~100 chars for preview
  const shortAbstract =
    abstract && abstract.length > 100
      ? abstract.slice(0, 100) + '...'
      : abstract;

  // Build DOI/Link url if available
  const trimmedDoi = doi?.trim();
  const publicationLink = trimmedDoi
    ? trimmedDoi.startsWith('http')
      ? trimmedDoi
      : `https://doi.org/${trimmedDoi}`
    : null;

  return (
    <div className="relative group">
      <div 
        className="absolute inset-0 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, ${colors.primary.purple[600]}1A, ${colors.primary.blue[600]}1A)`
        }}
      ></div>
      <div 
        className="relative backdrop-blur-lg rounded-xl p-6 border hover:scale-[1.02] transition-all duration-300"
        style={{
          backgroundColor: colors.background.glass,
          borderColor: colors.border.secondary
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.background.glass}CC`}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.background.glass}
      >
        <h3 
          className="font-semibold text-lg mb-2 transition-colors duration-300"
          style={{ color: colors.text.primary }}
          onMouseEnter={(e) => e.target.style.color = colors.primary.blue[400]}
          onMouseLeave={(e) => e.target.style.color = colors.text.primary}
        >
          {title}
        </h3>
        <div className="text-xs mb-2 italic" style={{ color: `${colors.text.secondary}99` }}>
          {formattedAuthors} {year ? `| ${year}` : ''}
        </div>
        <div className="text-xs mb-3" style={{ color: `${colors.text.secondary}80` }}>
          {venue || 'Unknown Venue'}
        </div>
        {shortAbstract && (
          <p className="text-sm mb-4 line-clamp-3" style={{ color: `${colors.text.secondary}B3` }}>{shortAbstract}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 rounded-md text-xs font-medium border"
              style={{
                backgroundColor: `${colors.accent.green[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.accent.green[500]}4D`
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-end">
          {publicationLink ? (
            <a
              href={publicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 border rounded-lg transition-all duration-200 text-xs font-medium"
              style={{
                backgroundColor: `${colors.accent.green[500]}33`,
                color: colors.text.primary,
                borderColor: `${colors.accent.green[500]}4D`
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${colors.text.primary}4D`}
              onMouseLeave={(e) => e.target.style.backgroundColor = `${colors.text.primary}33`}
            >
              <span>View Publication</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-xs italic" style={{ color: colors.text.disabled }}>No link available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
