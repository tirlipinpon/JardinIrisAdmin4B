const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

// Configuration FTP (à adapter)
const config = {
    host: 'ton-serveur.com',
    user: 'ton-username',
    password: 'ton-password',
    secure: true // ou false pour FTP normal
};

async function deploy() {
    const client = new ftp.Client();
    
    try {
        console.log('🚀 Connecting to FTP...');
        await client.access(config);
        
        console.log('📁 Uploading files...');
        
        // Upload du dossier dist
        await client.uploadFromDir('dist', '/public_html');
        
        // Upload spécifique de index.html en dernier
        console.log('📄 Uploading index.html...');
        await client.uploadFrom('dist/index.html', '/public_html/index.html');
        
        console.log('✅ Deployment completed!');
        
    } catch (err) {
        console.error('❌ Deployment failed:', err);
    } finally {
        client.close();
    }
}

deploy();
