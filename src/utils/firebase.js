import {
  arrayUnion,
  collection,
  doc,
  enableIndexedDbPersistence,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Getting Student Data with UID
// export const studentWithUid = async (uid) => {
//   const q = query(collection(db, 'students'), where('uid', '==', uid))
//   const snapshot = await getDocs(q)
//   if (!snapshot.empty) {
//     return snapshot.docs[0].data()
//   }
// }

// Update Student Data with UID
export const updateInfo = async (uid, usn) => {
  const q = query(
    collection(db, 'students'),
    where('usn', '==', usn.trim().toUpperCase())
  )
  const result = await getDocs(q)

  await updateDoc(result.docs[0].ref, {
    uid,
  })
}

// Getting Subject List of Each Class
export const fetchSubList = async (classStr) => {
  const docRef = doc(db, 'classes', classStr)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    return docSnap.data()
  } else {
    return []
  }
}

// Submiting Review
export const submitReview = async (subid, point) => {
  // Getting Ref of teacher
  const teacherRef = doc(db, `teacherstest/${subid}`)
  const teacherData = await getDoc(teacherRef)

  // Getting Prev Data
  const { avgRating, total } = teacherData.data()
  // Incrementing Total User
  const newTotal = total + 1
  // Algorithm for new Average
  const newAvg = (total * avgRating + point) / newTotal
  await setDoc(
    teacherData.ref,
    {
      avgRating: parseInt(newAvg.toFixed(4)),
      total: newTotal,
    },
    {
      merge: true,
    }
  ).catch((err) => console.log('Submit Failed', err))
}

// Marking Review of Students
export const markComplete = async (uid, subcode) => {
  const q = query(collection(db, 'students'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  await setDoc(
    snapshot.docs[0].ref,
    {
      complete: arrayUnion(subcode),
    },
    {
      merge: true,
    }
  ).catch((err) => console.log('Completion Update Failed', err))
}

// Making STatus is true
export const completeStatus = async (uid) => {
  const q = query(collection(db, 'students'), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    await updateDoc(snapshot.docs[0].ref, {
      status: true,
    })
  }
}

export const changeSem = async () => {
  const q = query(collection(db, 'students'), where('sem', '==', '7'))
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    snapshot.docs.map(
      async (item) =>
        await updateDoc(item.ref, {
          sem: '8',
        })
    )
  }
}
