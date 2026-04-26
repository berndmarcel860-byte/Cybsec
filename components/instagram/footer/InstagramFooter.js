import React from 'react';
import './InstagramFooter.css'; // Assuming this is where we store the footer styles

const InstagramFooter = () => {
    return (
        <div className="footer-container">
            <div className="footer-links">
                <a href="#">Meta</a>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Jobs</a>
                <a href="#">Help</a>
                <a href="#">API</a>
                <a href="#">Privacy</a>
                <a href="#">Consumer Health Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Locations</a>
                <a href="#">Instagram Lite</a>
                <a href="#">Threads</a>
                <a href="#">Contact Uploading & Non-Users</a>
                <a href="#">Meta Verified</a>
            </div>
            <div className="footer-bottom">
                <span>English ▼</span>
                <span>© 2024 Instagram from Meta</span>
            </div>
        </div>
    );
};

export default InstagramFooter;
