// How to make a project private

// Method 1: Using the ProjectForm (when creating or editing a project)
// The ProjectForm already includes a checkbox for setting isPrivate

// Method 2: Using the ProjectPrivacyToggle component
// Example usage in a component:

import React from 'react';
import ProjectPrivacyToggle from './components/ProjectPrivacyToggle';

function ProjectCard({ project }) {
  const handlePrivacyToggle = (isNowPrivate) => {
    console.log(`Project is now ${isNowPrivate ? 'private' : 'public'}`);
  };

  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      
      {/* Add the privacy toggle */}
      <ProjectPrivacyToggle 
        projectId={project._id}
        isPrivate={project.isPrivate}
        onToggle={handlePrivacyToggle}
      />
      
      {/* You can also use different sizes */}
      <div className="mt-2">
        <ProjectPrivacyToggle 
          projectId={project._id}
          isPrivate={project.isPrivate}
          size="small"
        />
        
        <ProjectPrivacyToggle 
          projectId={project._id}
          isPrivate={project.isPrivate}
          size="large"
        />
      </div>
    </div>
  );
}

// Method 3: Using the projectService directly
// Example usage:

import projectService from './services/projectService';

// Make a project private
async function makeProjectPrivate(projectId) {
  try {
    const result = await projectService.makeProjectPrivate(projectId);
    console.log('Project is now private:', result);
    return result;
  } catch (error) {
    console.error('Failed to make project private:', error);
    throw error;
  }
}

// Make a project public
async function makeProjectPublic(projectId) {
  try {
    const result = await projectService.makeProjectPublic(projectId);
    console.log('Project is now public:', result);
    return result;
  } catch (error) {
    console.error('Failed to make project public:', error);
    throw error;
  }
}

// Example usage in an async function:
// await makeProjectPrivate('your-project-id-here');
