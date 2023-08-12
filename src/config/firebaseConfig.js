import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: 'AIzaSyAMj6UR_VhGwp_KorXy-mNRCvSVqryH69g',
  authDomain: 'rurali-tea.firebaseapp.com',
  projectId: 'rurali-tea',
  storageBucket: 'rurali-tea.appspot.com',
  messagingSenderId: '807843866773',
  appId: '1:807843866773:web:322986588345bb6751d39c',
  measurementId: 'G-F715ECQT0N'
}

const firebaseApp = initializeApp(firebaseConfig)

export default firebaseApp
