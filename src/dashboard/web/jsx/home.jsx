import React from 'react';
import '../css/style3.css';

const Home = () => {
    return (
        <>
            <div className="dashboard-background">
                <div className="dashboard-overlay"></div>

                <div className="dashboard-content">
                    <h1 className="title-glow">Echoes of Avalone</h1>
                    <p className="subtitle">Bienvenue dans l’interface interactive de votre aventure RP</p>

                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h2>🛡️ Profil du Joueur</h2>
                            <p>Statistiques, quêtes, historique RP</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>⚔️ Commandes & Fonctions</h2>
                            <p>Explorez les interactions du bot et ses capacités</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>📜 Informations du Bot</h2>
                            <p>Version, mises à jour, changelog et roadmap</p>
                        </div>
                        <div className="dashboard-card">
                            <h2>🏰 Univers Avalone</h2>
                            <p>Histoire, cartes et guildes</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;