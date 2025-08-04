import React from 'react';
import { ExternalLink } from 'lucide-react';

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
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
      <div className="relative bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
        <h3 className="text-white font-semibold text-lg group-hover:text-sky-400 transition-colors duration-300 mb-2">
          {title}
        </h3>
        <div className="text-xs text-white/60 mb-2 italic">
          {formattedAuthors} {year ? `| ${year}` : ''}
        </div>
        <div className="text-xs text-white/50 mb-3">
          {venue || 'Unknown Venue'}
        </div>
        {shortAbstract && (
          <p className="text-white/70 text-sm mb-4 line-clamp-3">{shortAbstract}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-green-500/20 text-green-300 rounded-md text-xs font-medium border border-green-500/30"
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
              className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200 text-xs font-medium"
            >
              <span>View Publication</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic">No link available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
