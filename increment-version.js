const fs = require('fs');
const path = require('path');

// Chemin vers le fichier angular.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

console.log('Répertoire de travail:', process.cwd());
console.log('Chemin package.json:', packageJsonPath);

// Lire le fichier angular.json
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Incrémenter la version
  const currentVersion = packageJson.version || '0.0.1';
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  const newPatch = (patch || 0) + 1;
  const newVersion = `${major}.${minor}.${String(newPatch).padStart(2, '0')}`;
  packageJson.version = newVersion;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Version incrémentée à: ${newVersion}`);

  // Créer le dossier projects/admin-app/src/app/shared si il n'existe pas
  const projectsDir = path.join(process.cwd(), 'projects');
  const adminAppDir = path.join(projectsDir, 'admin-app');
  const srcDir = path.join(adminAppDir, 'src');
  const appDir = path.join(srcDir, 'app');
  const sharedDir = path.join(appDir, 'shared');

  console.log('Chemin projects:', projectsDir);
  console.log('Chemin admin-app:', adminAppDir);
  console.log('Chemin src:', srcDir);
  console.log('Chemin app:', appDir);
  console.log('Chemin shared:', sharedDir);

  // Créer les dossiers de manière récursive
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir);
    console.log('Dossier projects créé');
  }

  if (!fs.existsSync(adminAppDir)) {
    fs.mkdirSync(adminAppDir);
    console.log('Dossier admin-app créé');
  }

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
    console.log('Dossier src créé');
  }

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir);
    console.log('Dossier app créé');
  }

  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir);
    console.log('Dossier shared créé');
  }

  // Créer un fichier version.ts pour Angular
  const versionContent = `// Ce fichier est généré automatiquement
export const VERSION = {
  buildNumber: '${newVersion}',
  buildDate: '${new Date().toISOString()}'
};
`;

  // Écrire le fichier version.ts
  const versionFilePath = path.join(sharedDir, 'version.ts');
  fs.writeFileSync(versionFilePath, versionContent);
  console.log(`Fichier version.ts créé à: ${versionFilePath}`);

  // Vérifier que le fichier existe réellement
  if (fs.existsSync(versionFilePath)) {
    console.log('✓ Fichier version.ts confirmé créé');
    const stats = fs.statSync(versionFilePath);
    console.log(`Taille du fichier: ${stats.size} bytes`);
  } else {
    console.log('✗ Échec de la création du fichier');
  }

} catch (error) {
  console.error('Erreur:', error);
}
