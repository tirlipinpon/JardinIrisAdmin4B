export function getFormattedFullDateTime() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  // Récupérer les millisecondes et les convertir en microsecondes
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
  const microseconds = milliseconds + '000'; // Ajouter 000 pour convertir millisecondes en microsecondes
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00`;
}

export  function formatCurrentDateUs() : string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0 donc on ajoute 1
  const day = String(date.getDate()).padStart(2, '0');
// Formate la date au format YYYY-MM-DD
  return `${year}-${month}-${day}`;
}
