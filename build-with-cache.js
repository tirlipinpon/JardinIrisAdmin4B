const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building with cache busting...');

// 1. Build Angular
console.log('📦 Building Angular application...');
execSync('ng build --configuration=production', { stdio: 'inherit' });

// 2. Ajouter timestamp au index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    const timestamp = Date.now();
    
    // Ajouter meta tag pour cache busting
    const metaTag = `    <meta name="build-timestamp" content="${timestamp}">`;
    content = content.replace('<head>', `<head>\n${metaTag}`);
    
    // NE PAS modifier les références aux fichiers avec hash - Angular s'en charge déjà
    // content = content.replace(/src="([^"]*\.js)"/g, `src="$1?v=${timestamp}"`);
    // content = content.replace(/href="([^"]*\.css)"/g, `href="$1?v=${timestamp}"`);
    
    fs.writeFileSync(indexPath, content);
    console.log(`✅ Cache busting applied with timestamp: ${timestamp}`);
}

// 3. Créer un fichier de version
const versionFile = path.join(__dirname, 'dist', 'version.json');
const versionInfo = {
    timestamp: Date.now(),
    buildDate: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
};

fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
console.log('✅ Version file created');

console.log('🎉 Build completed with cache busting!');
