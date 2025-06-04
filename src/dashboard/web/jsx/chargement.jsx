import React from 'react';
import '../css/style.css';

const LoaderUI = ({ progress }) => {
    return (
        <>
            <div id="background"></div>
            <div className="loader-container">
                <img
                    src="https://zupimages.net/up/25/15/8td3.png"
                    alt="Logo"
                    className="logo"
                />
                <div className="progress-wrapper">
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                            id="progressFill"
                        />
                    </div>
                    <div className="progress-text" id="progressText">
                        {progress}%
                    </div>
                </div>
                <p className="loading-text">
                    {progress >= 100
                        ? 'Chargement terminé !'
                        : "Préparation de l'expérience..."}
                </p>
            </div>
        </>
    );
};

export default LoaderUI;