import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './YoutubeVideo.css';

function YoutubeVideo() {
  const [videos, setVideos] = useState([
    { id: 1, url: '', title: '' }
  ]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', urllink: '' });
  const [originalUrllink, setOriginalUrllink] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const API_BASE_URL = "https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev";

  // Fetch existing YouTube links
  useEffect(() => {
    fetchExistingVideos();
  }, []);

  const fetchExistingVideos = async () => {
    setLoading(true);
    try {
      // Use POST with operation "list" as shown in Postman
      const response = await axios.post(`${API_BASE_URL}/youtube-links`, {
        operation: "list"
      });
      console.log('Fetched videos response:', response.data);
      
      // Handle response structure: { statusCode: 200, body: "{\"items\": [...], \"count\": ...}" }
      let videosData = [];
      
      if (response.data && response.data.body) {
        // Parse the stringified body
        const parsedBody = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        
        // Extract items array from parsed body
        if (parsedBody.items && Array.isArray(parsedBody.items)) {
          videosData = parsedBody.items;
        } else if (Array.isArray(parsedBody)) {
          videosData = parsedBody;
        }
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        videosData = response.data.items;
      } else if (Array.isArray(response.data)) {
        videosData = response.data;
      }

      setExistingVideos(videosData);
      console.log('Extracted videos:', videosData);
    } catch (error) {
      console.error('Error fetching existing videos:', error);
      setExistingVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const addVideo = () => {
    const newVideo = {
      id: Date.now(),
      url: '',
      title: ''
    };
    setVideos([...videos, newVideo]);
  };

  const removeVideo = (id) => {
    setVideos(videos.filter(video => video.id !== id));
  };

  const updateVideo = (id, field, value) => {
    setVideos(videos.map(video => 
      video.id === id ? { ...video, [field]: value } : video
    ));
  };

  const handleSubmit = async () => {
    const validVideos = videos.filter(v => v.url.trim() !== '' && v.title.trim() !== '');
    
    if (validVideos.length === 0) {
      alert('Please add at least one video with both URL and title!');
      return;
    }

    setSubmitting(true);
    try {
      // Submit each video individually
      const promises = validVideos.map(async (video) => {
        try {
          const response = await axios.post(`${API_BASE_URL}/youtube-links`, {
            operation: "create",
            data: {
              urllink: video.url.trim(),
              title: video.title.trim()
            }
          });
          
          console.log('Video created:', response.data);
          
          // Handle response with stringified body
          if (response.data && response.data.body && typeof response.data.body === 'string') {
            try {
              const parsedBody = JSON.parse(response.data.body);
              console.log('Parsed response body:', parsedBody);
              return parsedBody;
            } catch (e) {
              console.error('Error parsing response body:', e);
            }
          }
          
          return response.data;
        } catch (error) {
          console.error('Error creating video:', error);
          throw error;
        }
      });

      await Promise.all(promises);
      alert('Videos created successfully!');
      
      // Clear form and refresh existing videos
      setVideos([{ id: 1, url: '', title: '' }]);
      fetchExistingVideos();
    } catch (error) {
      console.error('Error submitting videos:', error);
      alert('Failed to create videos. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update video
  const handleUpdateVideo = (video) => {
    const videoUrllink = video.urllink || video.url || '';
    setEditingVideo(video.id);
    setOriginalUrllink(videoUrllink); // Store original URL to identify the video
    setEditFormData({
      title: video.title || '',
      urllink: videoUrllink
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingVideo(null);
    setEditFormData({ title: '', urllink: '' });
    setOriginalUrllink('');
  };

  // Save updated video
  const handleSaveUpdate = async () => {
    if (!editFormData.title.trim() || !editFormData.urllink.trim()) {
      alert('Please fill in both title and URL!');
      return;
    }

    if (!originalUrllink) {
      alert('Error: Original video URL not found. Please try again.');
      return;
    }

    setUpdating(true);
    try {
      const newUrllink = editFormData.urllink.trim();
      const urlChanged = newUrllink !== originalUrllink;
      
      // If URL changed, we need to delete old and create new
      // because API uses urllink to identify which video to update
      if (urlChanged) {
        // Step 1: Delete the old video using original URL
        try {
          await axios.post(`${API_BASE_URL}/youtube-links`, {
            operation: "delete",
            data: {
              urllink: originalUrllink
            }
          });
          console.log('Old video deleted');
        } catch (deleteError) {
          console.error('Error deleting old video:', deleteError);
          // Continue anyway - might already be deleted
        }
        
        // Step 2: Create new video with new URL
        const createResponse = await axios.post(`${API_BASE_URL}/youtube-links`, {
          operation: "create",
          data: {
            urllink: newUrllink,
            title: editFormData.title.trim()
          }
        });
        
        console.log('New video created:', createResponse.data);
        alert('Video URL and title updated successfully!');
      } else {
        // URL didn't change, just update title using original URL to identify
        const response = await axios.post(`${API_BASE_URL}/youtube-links`, {
          operation: "update",
          data: {
            urllink: originalUrllink, // Always use original URL to identify the video
            title: editFormData.title.trim()
          }
        });

        console.log('Video updated:', response.data);

        // Handle response with stringified body
        if (response.data && response.data.body && typeof response.data.body === 'string') {
          try {
            const parsedBody = JSON.parse(response.data.body);
            console.log('Parsed update response:', parsedBody);
            
            // Check for errors in the response
            if (parsedBody.error) {
              alert(`Update failed: ${parsedBody.error}`);
              setUpdating(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing response body:', e);
          }
        }

        // Check statusCode in response
        if (response.data && response.data.statusCode && response.data.statusCode !== 200) {
          alert('Update failed. Please check the video URL and try again.');
          setUpdating(false);
          return;
        }

        alert('Video updated successfully!');
      }

      // Refresh the list and reset form
      setEditingVideo(null);
      setEditFormData({ title: '', urllink: '' });
      setOriginalUrllink('');
      fetchExistingVideos();
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = async (video) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this video? This action cannot be undone.');
    if (!confirmDelete) {
      return;
    }

    const videoId = video.id;
    const videoUrl = video.urllink || video.url;
    
    if (!videoUrl) {
      alert('Cannot delete: Video URL is missing.');
      return;
    }

    setDeleting(videoId);
    try {
      const response = await axios.post(`${API_BASE_URL}/youtube-links`, {
        operation: "delete",
        data: {
          urllink: videoUrl
        }
      });

      console.log('Video deleted:', response.data);

      // Handle response with stringified body
      if (response.data && response.data.body && typeof response.data.body === 'string') {
        try {
          const parsedBody = JSON.parse(response.data.body);
          console.log('Parsed delete response:', parsedBody);
        } catch (e) {
          console.error('Error parsing response body:', e);
        }
      }

      alert('Video deleted successfully!');
      fetchExistingVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>YouTube Video Management</h1>
        <p>Add and manage YouTube video links</p>
      </div>

      {/* Existing Videos Section */}
      <div className="existing-videos-section">
        <h2 className="section-title">Existing YouTube Links</h2>
        {loading ? (
          <div className="loading-message">Loading existing videos...</div>
        ) : existingVideos.length > 0 ? (
          <div className="existing-videos-list">
            {existingVideos.map((video, index) => (
              <div key={video.id || index} className="existing-video-card">
                {editingVideo === video.id ? (
                  // Edit Mode
                  <div className="edit-video-form">
                    <div className="input-group">
                      <label>Video Title</label>
                      <input
                        type="text"
                        placeholder="Enter video title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="input-group">
                      <label>YouTube URL</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={editFormData.urllink}
                        onChange={(e) => setEditFormData({ ...editFormData, urllink: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="edit-actions">
                      <button 
                        className="save-btn" 
                        onClick={handleSaveUpdate}
                        disabled={updating}
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        className="cancel-btn" 
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="existing-video-info">
                      <h3 className="existing-video-title">{video.title || 'Untitled'}</h3>
                      <p className="existing-video-url">{video.urllink || video.url}</p>
                      {video.description && (
                        <p className="existing-video-description">{video.description}</p>
                      )}
                      {video.text && (
                        <p className="existing-video-text">{video.text}</p>
                      )}
                    </div>
                    <div className="video-actions">
                      <button 
                        className="update-btn"
                        onClick={() => handleUpdateVideo(video)}
                        disabled={deleting === video.id}
                      >
                        Update
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteVideo(video)}
                        disabled={deleting === video.id}
                      >
                        {deleting === video.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-videos-message">No existing videos found.</div>
        )}
      </div>

      <div className="videos-list">
        {videos.map((video, index) => (
          <div key={video.id} className="video-card">
            <div className="card-header">
              <h3>Video {index + 1}</h3>
              {videos.length > 1 && (
                <button 
                  className="remove-btn"
                  onClick={() => removeVideo(video.id)}
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="input-group">
              <label>Video Title</label>
              <input
                type="text"
                placeholder="Enter video title"
                value={video.title}
                onChange={(e) => updateVideo(video.id, 'title', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label>YouTube URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={video.url}
                onChange={(e) => updateVideo(video.id, 'url', e.target.value)}
                className="input-field"
              />
            </div>

            {video.url && (
              <div className="preview">
                <p className="preview-label">Preview:</p>
                <p className="preview-url">{video.url}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="add-btn" onClick={addVideo}>
          + Add Another Video
        </button>
        <button 
          className="submit-btn" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Videos'}
        </button>
      </div>
    </div>
  );
}

export default YoutubeVideo;