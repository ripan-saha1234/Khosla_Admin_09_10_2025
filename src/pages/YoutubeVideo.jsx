import React, { useState } from 'react';
import './YoutubeVideo.css';

function YoutubeVideo() {
  const [videos, setVideos] = useState([
    { id: 1, url: '', title: '' }
  ]);

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

  const handleSubmit = () => {
    const validVideos = videos.filter(v => v.url.trim() !== '');
    console.log('Submitting videos:', validVideos);
    alert('Videos updated successfully!');
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>YouTube Video Management</h1>
        <p>Add and manage YouTube video links</p>
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
        <button className="submit-btn" onClick={handleSubmit}>
          Update All Videos
        </button>
      </div>
    </div>
  );
}

export default YoutubeVideo;