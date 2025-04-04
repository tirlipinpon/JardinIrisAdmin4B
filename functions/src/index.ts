// Start writing functions
// https://firebase.google.com/docs/functions/typescript
import * as functions from "firebase-functions/v1";
import axios from "axios";
// functions.pubsub.schedule("0 22 * * *") // Tous les jours à 22h
// tous les 5 minutes
exports.appelQuotidien = functions.pubsub.schedule("*/5 * * * *")
  .timeZone("Europe/Brussels") // Fuseau horaire de Bruxelles
  .onRun(async () => {
    try {
      const response = await axios.get("https://jardiniris-72ce2.web.app/home/login");
      console.log("Réponse reçue :", response.data);
    } catch (error) {
      console.error("Erreur lors de l appel à l application :", error);
    }
  });
