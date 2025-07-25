/* global __initial_auth_token */ // __initial_auth_token est une variable spécifique à l'environnement Canvas, elle sera undefined sur Netlify et la connexion anonyme sera utilisée.
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// Composant Modal pour afficher l'emploi du temps détaillé
const ScheduleModal = ({ entityName, scheduleType, scheduleData, onClose }) => {
  // Mappages pour les jours et les heures pour une meilleure lisibilité
  const dayMap = {
    '1': 'Lundi', '2': 'Mardi', '3': 'Mercredi', '4': 'Jeudi', '5': 'Vendredi',
    '6': 'Samedi', '7': 'Dimanche'
  };

  const hourMap = {
    '1': '8h20-9h10',
    '2': '9h10-10h00',
    '3': '10h20-11h10',
    '4': '11h10-12h00',
    '5': '13h10-14h00',
    '6': '14h00-14h50',
    '7': '15h05-15h55',
    '8': '15h55-16h45'
  };

  // Définir les jours et les heures pour les en-têtes du tableau
  const daysOfWeek = ['1', '2', '3', '4', '5']; // Lundi à Vendredi
  const hoursOfDay = ['1', '2', '3', '4', '5', '6', '7', '8']; // Heures 1 à 8

  // Créer une grille pour l'emploi du temps
  const scheduleGrid = {};
  daysOfWeek.forEach(day => {
    scheduleGrid[day] = {};
    hoursOfDay.forEach(hour => {
      scheduleGrid[day][hour] = null; // Initialiser les cellules comme vides
    });
  });

  // Remplir la grille avec les données de l'emploi du temps
  scheduleData.forEach(entry => {
    const day = entry.day;
    const hour = entry.hour;

    if (daysOfWeek.includes(day) && hoursOfDay.includes(hour)) {
      // Le contenu de la cellule dépend du type d'entité
      let cellContent = '';
      if (scheduleType === 'professors') {
        cellContent = (
          <>
            <div className="font-semibold text-blue-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Classes: {entry.class}</div>
            <div className="text-gray-700 text-xs">Local: {entry.room}</div>
          </>
        );
      } else if (scheduleType === 'classes') {
        cellContent = (
          <>
            <div className="font-semibold text-green-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Prof: {entry.professorName}</div>
            <div className="text-gray-700 text-xs">Local: {entry.room}</div>
          </>
        );
      } else if (scheduleType === 'rooms') {
        cellContent = (
          <>
            <div className="font-semibold text-purple-800">{entry.course}</div>
            <div className="text-gray-700 text-xs">Prof: {entry.professorName}</div>
            <div className="text-gray-700 text-xs">Classes: {entry.class}</div>
          </>
        );
      }
      scheduleGrid[day][hour] = cellContent;
    }
  });

  // Définir le titre de la modale
  let modalTitle = '';
  switch (scheduleType) {
    case 'professors':
      modalTitle = `Emploi du temps de ${entityName}`;
      break;
    case 'classes':
      modalTitle = `Emploi du temps de la classe ${entityName}`;
      break;
    case 'rooms':
      modalTitle = `Emploi du temps du local ${entityName}`;
      break;
    default:
      modalTitle = `Détails de l'emploi du temps pour ${entityName}`;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto"> {/* Augmenté la largeur max */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
          >
            &times;
          </button>
        </div>
        {scheduleData.length > 0 ? (
          <div className="overflow-x-auto max-h-[70vh] pb-4"> {/* Hauteur max pour le défilement */}
            <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr> {/* Début de la ligne d'en-tête */}
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Heure / Jour</th>
                  {daysOfWeek.map(dayKey => (<th key={dayKey} className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">{dayMap[dayKey]}</th>))}
                </tr> {/* Fin de la ligne d'en-tête */}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hoursOfDay.map(hourKey => (
                  <tr key={hourKey} className="h-20"> {/* Début de chaque ligne d'heure */}
                    <td className="py-2 px-3 text-sm text-gray-800 font-medium border-r border-gray-200">{hourMap[hourKey]}</td>
                    {daysOfWeek.map(dayKey => (<td key={`${dayKey}-${hourKey}`} className="py-2 px-3 text-sm text-gray-800 align-top border-r border-gray-200">{scheduleGrid[dayKey][hourKey]}</td>))}
                  </tr> /* Fin de chaque ligne d'heure */
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">Aucun emploi du temps trouvé pour cette entité.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// Clé spéciale pour les professeurs dont le sigle est manquant ou invalide
const UNKNOWN_PROFESSOR_KEY = 'INCONNU';

// Helper pour convertir les objets Set en Array pour la compatibilité Firestore
const convertSetsToArrays = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertSetsToArrays);
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] instanceof Set) {
          newObj[key] = Array.from(obj[key]);
        } else {
          newObj[key] = convertSetsToArrays(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
};

function App() {
  // Déclaration de appId au début du composant pour qu'il soit accessible globalement
  // Utilisation de process.env pour accéder aux variables d'environnement Netlify
  const appId = typeof process.env.REACT_APP_APP_ID !== 'undefined' ? process.env.REACT_APP_APP_ID : 'default-app-id';

  const [professorHours, setProfessorHours] = useState({});
  const [allSchedules, setAllSchedules] = useState({ professors: {}, classes: {}, rooms: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('professors');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Aucun fichier sélectionné");
  const [fileUrl, setFileUrl] = useState(''); // État pour l'URL du fichier

  // Firebase states
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [uploaderId, setUploaderId] = useState(null); // ID de l'utilisateur qui a uploadé le fichier (pour info, pas pour permission)
  const [authorizedUploaderIds, setAuthorizedUploaderIds] = useState([]); // Nouvelle liste des UIDs autorisés

  // Initialisation de Firebase et authentification
  useEffect(() => {
    try {
      // Utilisation de process.env.REACT_APP_FIREBASE_CONFIG
      const firebaseConfig = JSON.parse(typeof process.env.REACT_APP_FIREBASE_CONFIG !== 'undefined' ? process.env.REACT_APP_FIREBASE_CONFIG : '{}');

      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is empty. Cannot initialize Firebase.");
        setError("Configuration Firebase manquante. L'application ne peut pas se connecter à la base de données.");
        setLoading(false);
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            // Dans l'environnement Netlify, __initial_auth_token sera undefined,
            // donc nous nous rabattrons sur la connexion anonyme.
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (anonError) {
            console.error("Erreur lors de la connexion anonyme ou avec jeton:", anonError);
            setError("Erreur d'authentification. L'application pourrait ne pas fonctionner correctement. Vérifiez les méthodes de connexion Firebase.");
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Erreur lors de l'initialisation de Firebase:", err);
      setError("Erreur lors de l'initialisation de Firebase. Vérifiez votre configuration.");
      setLoading(false);
    }
  }, [appId]); // Ajout de appId comme dépendance pour s'assurer qu'elle est bien définie

  // Chargement des données des horaires depuis Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return;

    // Utilisation de appId déjà déclarée
    const scheduleDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main-schedule');

    const unsubscribe = onSnapshot(scheduleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfessorHours(data.professorHours || {});
        setAllSchedules(data.allSchedules || { professors: {}, classes: {}, rooms: {} });
        setUploaderId(data.uploaderId || null); // Conserve l'ID du dernier uploader pour information
        setLoading(false);
      } else {
        console.log("Aucun emploi du temps trouvé dans Firestore. Le premier upload le créera.");
        setLoading(false);
        setProfessorHours({});
        setAllSchedules({ professors: {}, classes: {}, rooms: {} });
        setUploaderId(null);
      }
    }, (dbError) => {
      console.error("Erreur lors du chargement des données d'horaires depuis Firestore:", dbError);
      setError("Impossible de charger les données d'horaires. Veuillez réessayer.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, appId]); // Ajout de appId comme dépendance

  // Chargement de la liste des UIDs autorisés depuis Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return;

    // Utilisation de appId déjà déclarée
    const authorizedUploaderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'authorized_uploaders', 'list');

    const unsubscribe = onSnapshot(authorizedUploaderDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAuthorizedUploaderIds(data.uids || []);
      } else {
        console.log("Document 'authorized_uploaders/list' non trouvé. Il doit être créé manuellement.");
        setAuthorizedUploaderIds([]);
      }
    }, (dbError) => {
      console.error("Erreur lors du chargement des UIDs autorisés:", dbError);
      // Ne pas définir d'erreur critique ici pour ne pas bloquer l'app si la liste n'est pas trouvée
    });

    return () => unsubscribe();
  }, [db, isAuthReady, appId]); // Ajout de appId comme dépendance

  /**
   * Sauvegarde les données traitées dans Firestore.
   * @param {object} hoursData Les heures totales des professeurs.
   * @param {object} schedulesData Les emplois du temps détaillés.
   * @param {string} currentUserId L'ID de l'utilisateur actuel.
   */
  const saveScheduleToFirestore = async (hoursData, schedulesData, currentUserId) => {
    if (!db || !currentUserId) {
      setError("Base de données non prête ou utilisateur non identifié pour la sauvegarde.");
      return;
    }

    setLoading(true);
    setError(null);

    // Utilisation de appId déjà déclarée
    const scheduleDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main-schedule');
    const authorizedUploaderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'authorized_uploaders', 'list');

    try {
      const schedulesDataForFirestore = convertSetsToArrays(schedulesData);

      // Vérifier si le document 'main-schedule' existe déjà
      const scheduleDocSnap = await getDoc(scheduleDocRef); // Utilisez getDoc ici pour vérifier l'existence
      const isFirstUpload = !scheduleDocSnap.exists();

      await setDoc(scheduleDocRef, {
        professorHours: hoursData,
        allSchedules: schedulesDataForFirestore,
        uploaderId: currentUserId, // L'ID de la personne qui vient d'uploader
        lastUpdatedBy: currentUserId,
        lastUpdatedAt: new Date().toISOString()
      });
      console.log("Données sauvegardées avec succès dans Firestore !");

      // Si c'est le tout premier upload, ajoutez l'UID de l'utilisateur actuel à la liste des uploaders autorisés
      if (isFirstUpload) {
        const authorizedUploaderDocSnap = await getDoc(authorizedUploaderDocRef);
        let updatedAuthorizedUids = [];

        if (authorizedUploaderDocSnap.exists()) {
          // Si le document existe, ajoutez l'UID à la liste existante si pas déjà présent
          const existingUids = authorizedUploaderDocSnap.data().uids || [];
          if (!existingUids.includes(currentUserId)) {
            updatedAuthorizedUids = [...existingUids, currentUserId];
          } else {
            // If it already exists, just use the existing ones
            updatedAuthorizedUids = existingUids;
          }
        } else {
          // Si le document n'existe pas, créez-le avec l'UID de l'utilisateur actuel
          updatedAuthorizedUids = [currentUserId];
        }
        await setDoc(authorizedUploaderDocRef, { uids: updatedAuthorizedUids });
        setAuthorizedUploaderIds(updatedAuthorizedUids); // Mettre à jour l'état local
        console.log("UID de l'uploader ajouté à la liste des autorisés.");
      }

      setUploaderId(currentUserId); // Met à jour l'ID de l'uploader localement
    } catch (saveError) {
      console.error("Erreur lors de la sauvegarde dans Firestore:", saveError);
      setError("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Traite le contenu du fichier pour extraire les heures de cours et l'emploi du temps détaillé.
   * Appelle saveScheduleToFirestore après traitement.
   * @param {string} content Le contenu textuel du fichier.
   */
  const processFileContent = async (content) => {
    setLoading(true);
    setError(null);
    const uniqueProfessorSlots = {};
    const professorRawEntries = {};
    const classRawEntries = {};
    const roomRawEntries = {};

    try {
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.trim() === '') {
          return;
        }

        const parts = line.split(',');

        if (parts.length < 7) {
          const defaultEntry = {
            courseNumber: 'N/A', class: 'N/A', professorName: UNKNOWN_PROFESSOR_KEY,
            course: 'N/A', room: 'N/A', day: '0', hour: '0'
          };
          if (!professorRawEntries[UNKNOWN_PROFESSOR_KEY]) professorRawEntries[UNKNOWN_PROFESSOR_KEY] = [];
          professorRawEntries[UNKNOWN_PROFESSOR_KEY].push(defaultEntry);
          if (!uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY]) uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY] = new Set();
          uniqueProfessorSlots[UNKNOWN_PROFESSOR_KEY].add(`N/A-0-0-${Date.now()}-${Math.random()}`);
          console.warn(`Ligne mal formée ou incomplète (moins de 7 champs) : "${line}". Attribuée à INCONNU.`);
          return;
        }

        const courseNumber = (parts[0] || '').replace(/"/g, '').trim() || 'N/A';
        const className = (parts[1] || '').replace(/"/g, '').trim() || 'N/A';
        let professorName = (parts[2] || '').replace(/"/g, '').trim();
        const courseName = (parts[3] || '').replace(/"/g, '').trim() || 'N/A';
        const roomName = (parts[4] || '').replace(/"/g, '').trim() || 'N/A';
        const day = (parts[5] || '').trim();
        const hour = (parts[6] || '').trim();

        if (!professorName || professorName.length !== 3 || !/^[A-Z]{3}$/.test(professorName)) {
          console.warn(`Sigle de professeur invalide ou manquant : "${professorName}" dans la ligne "${line}". Attribué à INCONNU.`);
          professorName = UNKNOWN_PROFESSOR_KEY;
        }

        const entry = {
          courseNumber: courseNumber, class: className, professorName: professorName,
          course: courseName, room: roomName, day: day, hour: hour
        };

        if (!professorRawEntries[professorName]) professorRawEntries[professorName] = [];
        professorRawEntries[professorName].push(entry);

        if (className !== 'N/A') {
          if (!classRawEntries[className]) classRawEntries[className] = [];
          classRawEntries[className].push(entry);
        }

        if (roomName !== 'N/A') {
          if (!roomRawEntries[roomName]) roomRawEntries[roomName] = [];
          roomRawEntries[roomName].push(entry);
        }

        if (!uniqueProfessorSlots[professorName]) {
          uniqueProfessorSlots[professorName] = new Set();
        }
        uniqueProfessorSlots[professorName].add(`${courseNumber}-${day}-${hour}`);
      });

      const finalAllSchedules = { professors: {}, classes: {}, rooms: {} };

      for (const prof in professorRawEntries) {
        const groupedSlots = {};
        professorRawEntries[prof].forEach(entry => {
          const slotKey = `${entry.courseNumber}-${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              courseNumber: entry.courseNumber, day: entry.day, hour: entry.hour,
              course: entry.course, room: entry.room, classes: new Set(), professorName: entry.professorName
            };
          }
          groupedSlots[slotKey].classes.add(entry.class);
        });
        finalAllSchedules.professors[prof] = Object.values(groupedSlots).map(groupedEntry => ({
          courseNumber: groupedEntry.courseNumber, day: groupedEntry.day, hour: groupedEntry.hour,
          course: groupedEntry.course, room: groupedEntry.room,
          class: Array.from(groupedEntry.classes).sort().join(', '), // Pour l'affichage
          professorName: groupedEntry.professorName
        }));
      }

      for (const cls in classRawEntries) {
        const groupedSlots = {};
        classRawEntries[cls].forEach(entry => {
          const slotKey = `${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              day: entry.day, hour: entry.hour, class: entry.class,
              professorNames: new Set(), courses: new Set(), rooms: new Set()
            };
          }
          groupedSlots[slotKey].professorNames.add(entry.professorName);
          groupedSlots[slotKey].courses.add(entry.course);
          groupedSlots[slotKey].rooms.add(entry.room);
        });
        finalAllSchedules.classes[cls] = Object.values(groupedSlots).map(groupedEntry => ({
          day: groupedEntry.day, hour: groupedEntry.hour, class: groupedEntry.class,
          professorName: Array.from(groupedEntry.professorNames).sort().join(', '),
          course: Array.from(groupedEntry.courses).sort().join(', '),
          room: Array.from(groupedEntry.rooms).sort().join(', ')
        }));
      }

      for (const room in roomRawEntries) {
        const groupedSlots = {};
        roomRawEntries[room].forEach(entry => {
          const slotKey = `${entry.day}-${entry.hour}`;
          if (!groupedSlots[slotKey]) {
            groupedSlots[slotKey] = {
              day: entry.day, hour: entry.hour, room: entry.room,
              classes: new Set(), professorNames: new Set(), courses: new Set()
            };
          }
          groupedSlots[slotKey].classes.add(entry.class);
          groupedSlots[slotKey].professorNames.add(entry.professorName);
          groupedSlots[slotKey].courses.add(entry.course);
        });
        finalAllSchedules.rooms[room] = Object.values(groupedSlots).map(groupedEntry => ({
          day: groupedEntry.day, hour: groupedEntry.hour, room: groupedEntry.room,
          class: Array.from(groupedEntry.classes).sort().join(', '),
          professorName: Array.from(groupedEntry.professorNames).sort().join(', '),
          course: Array.from(groupedEntry.courses).sort().join(', ')
        }));
      }

      const finalProfessorHoursMap = {};
      for (const prof in uniqueProfessorSlots) {
        finalProfessorHoursMap[prof] = uniqueProfessorSlots[prof].size;
      }

      setProfessorHours(finalProfessorHoursMap);
      setAllSchedules(finalAllSchedules);

      // Sauvegarder dans Firestore après un traitement réussi
      if (userId) { // S'assurer que l'utilisateur est authentifié pour sauvegarder
        await saveScheduleToFirestore(finalProfessorHoursMap, finalAllSchedules, userId);
      } else {
        setError("Impossible de sauvegarder : utilisateur non authentifié.");
        setLoading(false);
      }

    } catch (err) {
      console.error("Erreur lors du traitement du fichier:", err);
      setError("Erreur lors du traitement du fichier. Veuillez vérifier le format.");
      setLoading(false);
    }
  };

  /**
   * Gère le changement de fichier via l'input de type 'file'.
   * Lit le contenu du fichier et le passe à processFileContent.
   * @param {Event} event L'événement de changement de fichier.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async (e) => { // Rendre async pour await processFileContent
        try {
          await processFileContent(e.target.result);
        } catch (err) {
          console.error("Erreur lors de la lecture ou du traitement du fichier:", err);
          setError("Erreur lors de la lecture ou du traitement du fichier. Veuillez vous assurer que c'est un fichier texte valide.");
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Impossible de lire le fichier.");
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      setFileName("Aucun fichier sélectionné");
    }
  };

  /**
   * Gère le téléchargement du fichier depuis une URL.
   *
   */
  const handleFetchFileFromUrl = async () => {
    if (!fileUrl) {
      setError("Veuillez saisir une URL de fichier.");
      return;
    }
    setLoading(true);
    setError(null);
    console.log("Tentative de chargement depuis l'URL:", fileUrl); // Log the URL being fetched
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      const textContent = await response.text();
      await processFileContent(textContent);
      setFileName(`Fichier chargé depuis URL: ${fileUrl}`); // Mettre à jour le nom du fichier pour l'affichage
    } catch (err) {
      console.error("Erreur lors du chargement du fichier depuis l'URL:", err);
      setError(`Impossible de charger le fichier depuis l'URL : ${err.message}. Veuillez vérifier l'URL et les permissions CORS.`);
      setLoading(false);
    }
  };


  // Fonction pour ouvrir la modale avec l'emploi du temps de l'entité sélectionnée
  const openScheduleModal = (name, type) => {
    setSelectedEntity({ name, type });
    setIsModalOpen(true);
  };

  // Fonction pour fermer la modale
  const closeScheduleModal = () => {
    setIsModalOpen(false);
    setSelectedEntity(null);
  };

  // Préparer les données pour l'affichage dans les tableaux
  const getSortedData = (type) => {
    let dataArray = [];
    let hoursMap = {};

    if (type === 'professors') {
      hoursMap = professorHours;
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      // Trier 'INCONNU' en dernier, le reste par ordre alphabétique
      dataArray.sort((a, b) => {
        if (a.name === UNKNOWN_PROFESSOR_KEY) return 1;
        if (b.name === UNKNOWN_PROFESSOR_KEY) return -1;
        return a.name.localeCompare(b.name); // Tri alphabétique par nom
      });
    } else if (type === 'classes') {
      hoursMap = {};
      // Le total des heures pour les classes est le nombre d'entrées regroupées
      for (const className in allSchedules.classes) {
        hoursMap[className] = allSchedules.classes[className].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique par nom
    } else if (type === 'rooms') {
      hoursMap = {};
      // Le total des heures pour les locaux est le nombre d'entrées regroupées
      for (const roomName in allSchedules.rooms) {
        hoursMap[roomName] = allSchedules.rooms[roomName].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique par nom
    }
    return dataArray;
  };

  const currentData = getSortedData(activeTab);

  // Déterminer si l'utilisateur actuel est un uploader autorisé
  const isCurrentUserAuthorizedUploader = userId && authorizedUploaderIds.includes(userId);
  // Permettre le premier upload si aucun horaire n'a été uploadé ET aucune liste d'uploaders n'existe
  // OU si l'utilisateur actuel est dans la liste des uploaders autorisés.
  const canUpload = userId && (
    (Object.keys(professorHours).length === 0 && authorizedUploaderIds.length === 0) || // Permet le tout premier upload
    isCurrentUserAuthorizedUploader
  );


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Gestion des Horaires
        </h1>

        {/* Section de téléchargement de fichier (conditionnelle) */}
        {canUpload ? (
          <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg flex flex-col items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mettre à jour les horaires</h2>

            {/* Téléchargement manuel de fichier */}
            <div className="w-full mb-4">
              <label htmlFor="file-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md">
                Choisir un fichier Untis (.TXT)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              <span className="mt-3 text-gray-700 text-sm block text-center">{fileName}</span>
            </div>

            {/* Séparateur */}
            <div className="w-full border-b border-gray-300 my-4 text-center">
              <span className="bg-white px-2 text-gray-500 text-sm">OU</span>
            </div>

            {/* Mise à jour via URL */}
            <div className="w-full">
              <label htmlFor="file-url" className="block text-gray-700 text-sm font-bold mb-2">
                URL du fichier texte :
              </label>
              <input
                type="url"
                id="file-url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Ex: https://example.com/horaires.txt"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3"
                disabled={loading}
              />
              <button
                onClick={handleFetchFileFromUrl}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md w-full"
                disabled={loading}
              >
                Charger depuis l'URL
              </button>
            </div>

            {loading && <p className="text-blue-600 mt-4">Traitement en cours...</p>}
            {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
          </div>
        ) : (
          <div className="mb-6 p-4 border border-gray-200 bg-gray-50 rounded-lg text-center text-gray-700">
            <p className="font-semibold">Mode consultation uniquement.</p>
            <p className="text-sm">Seuls les utilisateurs autorisés peuvent télécharger les fichiers.</p>
            {authorizedUploaderIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                UIDs autorisés : {authorizedUploaderIds.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Onglets de navigation */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <button
            className={`py-2 px-4 text-lg font-medium ${
              activeTab === 'professors'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('professors')}
          >
            Professeurs
          </button>
          <button
            className={`ml-4 py-2 px-4 text-lg font-medium ${
              activeTab === 'classes'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('classes')}
          >
            Classes
          </button>
          <button
            className={`ml-4 py-2 px-4 text-lg font-medium ${
              activeTab === 'rooms'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-blue-500'
            } focus:outline-none transition duration-150 ease-in-out`}
            onClick={() => setActiveTab('rooms')}
          >
            Locaux
          </button>
        </div>

        {loading && !error ? (
          <p className="text-center text-blue-600">Chargement des données...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                    {activeTab === 'professors' && 'Nom du Professeur'}
                    {activeTab === 'classes' && 'Nom de la Classe'}
                    {activeTab === 'rooms' && 'Nom du Local'}
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                    Total des Heures
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr
                      key={item.name}
                      className={`cursor-pointer hover:bg-blue-100 transition duration-150 ease-in-out ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                      onClick={() => openScheduleModal(item.name, activeTab)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                        {item.hours}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-4 text-center text-gray-500">
                      Aucune donnée trouvée pour cette catégorie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">Note sur le traitement du fichier :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Cette application analyse chaque ligne du fichier comme un créneau de cours.
            </li>
            <li>
              Pour les **professeurs**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le numéro de cours, le jour et l'heure). Si un professeur enseigne le même cours au même moment à plusieurs classes, ces classes sont **regroupées** sur une seule ligne dans l'emploi du temps détaillé du professeur.
            </li>
            <li>
              Pour les **classes**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le jour et l'heure). Si plusieurs cours sont donnés simultanément pour une même classe, les informations de professeur, de cours et de local sont **regroupées** sur une seule ligne.
            </li>
            <li>
              Pour les **locaux**, le "Total des Heures" représente le nombre de créneaux horaires uniques (définis par le jour et l'heure). Si un local est utilisé par plusieurs classes ou professeurs pour différents cours au même moment, ces informations sont **regroupées** sur une seule ligne.
            </li>
            <li>
              Si le sigle du professeur est manquant ou ne respecte pas le format de 3 lettres majuscules, l'heure est attribuée à un professeur "INCONNU".
            </li>
            <li>
              Les champs manquants (classe, cours, local, jour, heure) sont affichés comme "N/A" (Non Applicable) dans l'emploi du temps détaillé.
            </li>
            <li>
              Toutes les listes sont triées par ordre alphabétique du nom de l'entité. Le professeur "INCONNU" est toujours affiché en dernier.
            </li>
          </ul>
          <p className="mt-2">
            Cliquez sur le nom d'une entité (professeur, classe ou local) dans le tableau pour afficher son emploi du temps détaillé.
          </p>
          <div className="mt-4 pt-2 border-t border-blue-300">
            <p className="font-semibold">Informations utilisateur (pour le débogage) :</p>
            <p>Votre ID utilisateur actuel : <span className="font-mono text-gray-700 break-all">{userId || "Non connecté"}</span></p>
            <p>ID du dernier uploader : <span className="font-mono text-gray-700 break-all">{uploaderId || "Non défini"}</span></p>
            <p>UIDs autorisés à uploader : <span className="font-mono text-gray-700 break-all">{authorizedUploaderIds.length > 0 ? authorizedUploaderIds.join(', ') : "Aucun défini (le premier upload définira le premier autorisé)"}</span></p>
            {userId && isCurrentUserAuthorizedUploader && (
              <p className="text-green-700 font-semibold">Vous êtes un uploader autorisé.</p>
            )}
            {userId && !isCurrentUserAuthorizedUploader && authorizedUploaderIds.length > 0 && (
              <p className="text-red-700 font-semibold">Vous n'êtes pas un uploader autorisé.</p>
            )}
            {!userId && (
              <p className="text-orange-700 font-semibold">En attente de connexion ou connexion anonyme.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modale de l'emploi du temps */}
      {isModalOpen && selectedEntity && (
        <ScheduleModal
          entityName={selectedEntity.name}
          scheduleType={selectedEntity.type}
          scheduleData={allSchedules[selectedEntity.type][selectedEntity.name] || []}
          onClose={closeScheduleModal}
        />
      )}
    </div>
  );
}

export default App;
