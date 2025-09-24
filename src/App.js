/* global __app_id, __firebase_config, __initial_auth_token */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// Composant Modal pour afficher l'emploi du temps détaillé
const ScheduleModal = ({ entityName, scheduleType, scheduleData, onClose }) => {
  // Mappages pour les jours et les heures pour une meilleure lisibilité
  const dayMap = {
    '1': 'Lundi', '2': 'Mardi', '3': 'Jeudi', '4': 'Mercredi', '5': 'Vendredi',
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-auto">
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
          <div className="overflow-x-auto max-h-[70vh] pb-4">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Heure / Jour</th>
                  {daysOfWeek.map(dayKey => (<th key={dayKey} className="py-2 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/5">{dayMap[dayKey]}</th>))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hoursOfDay.map(hourKey => (
                  <tr key={hourKey} className="h-20">
                    <td className="py-2 px-3 text-sm text-gray-800 font-medium border-r border-gray-200">{hourMap[hourKey]}</td>
                    {daysOfWeek.map(dayKey => (<td key={`${dayKey}-${hourKey}`} className="py-2 px-3 text-sm text-gray-800 align-top border-r border-gray-200">{scheduleGrid[dayKey][hourKey]}</td>))}
                  </tr>
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
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  const [professorHours, setProfessorHours] = useState({});
  const [allSchedules, setAllSchedules] = useState({ professors: {}, classes: {}, rooms: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('professors');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("Aucun fichier sélectionné");
  const [fileUrl, setFileUrl] = useState('');

  // Firebase states
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [uploaderId, setUploaderId] = useState(null);
  const [authorizedUploaderIds, setAuthorizedUploaderIds] = useState([]);

  // Initialisation de Firebase et authentification
  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

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
  }, [appId]);

  // Chargement des données des horaires depuis Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return;

    const scheduleDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main-schedule');

    const unsubscribe = onSnapshot(scheduleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfessorHours(data.professorHours || {});
        setAllSchedules(data.allSchedules || { professors: {}, classes: {}, rooms: {} });
        setUploaderId(data.uploaderId || null);
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
  }, [db, isAuthReady, appId]);

  // Chargement de la liste des UIDs autorisés depuis Firestore
  useEffect(() => {
    if (!db || !isAuthReady) return;

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
    });

    return () => unsubscribe();
  }, [db, isAuthReady, appId]);

  /**
   * Sauvegarde les données traitées dans Firestore.
   */
  const saveScheduleToFirestore = async (hoursData, schedulesData, currentUserId) => {
    if (!db || !currentUserId) {
      setError("Base de données non prête ou utilisateur non identifié pour la sauvegarde.");
      return;
    }

    setLoading(true);
    setError(null);

    const scheduleDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedules', 'main-schedule');
    const authorizedUploaderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'authorized_uploaders', 'list');

    try {
      const schedulesDataForFirestore = convertSetsToArrays(schedulesData);

      const scheduleDocSnap = await getDoc(scheduleDocRef);
      const isFirstUpload = !scheduleDocSnap.exists();

      await setDoc(scheduleDocRef, {
        professorHours: hoursData,
        allSchedules: schedulesDataForFirestore,
        uploaderId: currentUserId,
        lastUpdatedBy: currentUserId,
        lastUpdatedAt: new Date().toISOString()
      });
      console.log("Données sauvegardées avec succès dans Firestore !");

      if (isFirstUpload) {
        const authorizedUploaderDocSnap = await getDoc(authorizedUploaderDocRef);
        let updatedAuthorizedUids = [];

        if (authorizedUploaderDocSnap.exists()) {
          const existingUids = authorizedUploaderDocSnap.data().uids || [];
          if (!existingUids.includes(currentUserId)) {
            updatedAuthorizedUids = [...existingUids, currentUserId];
          } else {
            updatedAuthorizedUids = existingUids;
          }
        } else {
          updatedAuthorizedUids = [currentUserId];
        }
        await setDoc(authorizedUploaderDocRef, { uids: updatedAuthorizedUids });
        setAuthorizedUploaderIds(updatedAuthorizedUids);
        console.log("UID de l'uploader ajouté à la liste des autorisés.");
      }

      setUploaderId(currentUserId);
    } catch (saveError) {
      console.error("Erreur lors de la sauvegarde dans Firestore:", saveError);
      setError("Erreur lors de la sauvegarde des données. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Traite le contenu du fichier pour extraire les heures de cours et l'emploi du temps détaillé.
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
          class: Array.from(groupedEntry.classes).sort().join(', '),
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

      if (userId) {
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
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
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
   */
  const handleFetchFileFromUrl = async () => {
    if (!fileUrl) {
      setError("Veuillez saisir une URL de fichier.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }
      const textContent = await response.text();
      await processFileContent(textContent);
      setFileName(`Fichier chargé depuis URL: ${fileUrl}`);
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
      dataArray.sort((a, b) => {
        if (a.name === UNKNOWN_PROFESSOR_KEY) return 1;
        if (b.name === UNKNOWN_PROFESSOR_KEY) return -1;
        return a.name.localeCompare(b.name);
      });
    } else if (type === 'classes') {
      hoursMap = {};
      for (const className in allSchedules.classes) {
        hoursMap[className] = allSchedules.classes[className].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'rooms') {
      hoursMap = {};
      for (const roomName in allSchedules.rooms) {
        hoursMap[roomName] = allSchedules.rooms[roomName].length;
      }
      dataArray = Object.entries(hoursMap).map(([name, hours]) => ({ name, hours }));
      dataArray.sort((a, b) => a.name.localeCompare(b.name));
    }
    return dataArray;
  };

  const currentData = getSortedData(activeTab);

  const isCurrentUserAuthorizedUploader = userId && authorizedUploaderIds.includes(userId);
  const canUpload = userId && (
    (Object.keys(professorHours).length === 0 && authorizedUploaderIds.length === 0) ||
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
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Heures
                  </th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {item.hours}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openScheduleModal(item.name, activeTab)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full shadow transition duration-150 ease-in-out"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      Aucune donnée disponible. Veuillez télécharger un fichier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Informations de l'utilisateur et de l'application */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            Votre ID utilisateur (UID) :{' '}
            <span className="font-mono text-gray-700 break-all">{userId || 'N/A'}</span>
          </p>
          <p>
            ID de l'application (pour le stockage des données) :{' '}
            <span className="font-mono text-gray-700 break-all">{appId}</span>
          </p>
        </div>
      </div>

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
