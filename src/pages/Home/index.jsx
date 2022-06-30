import React, { useEffect, useState } from 'react'
import { completeStatus } from '../../utils/firebase'
import './home.style.css'
import { motion } from 'framer-motion'
import TeacherCard from '../../components/teacherCard'
import usePWA from 'react-pwa-install-prompt'
import useData from '../../hooks/useData'
import SkeletonHome from '../../components/skeleton/skeletonHome'

const usncardVariants = {
  hidden: {
    y: -60,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      mass: 0.5,
      damping: 8,
    },
  },

  exit: {
    y: -200,
    opacity: 0,
    transition: { ease: 'easeInOut' },
  },
}

const wrappercardVariants = {
  hidden: {
    y: 160,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      mass: 0.5,
      damping: 8,
      when: 'beforeChildren',
      staggerChildren: 0.4,
    },
  },

  exit: {
    y: 200,
    opacity: 0,
    transition: { ease: 'easeInOut' },
  },
}

const pwaVariants = {
  hidden: {
    scale: 0.3,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { delay: 0.5, duration: 0.37, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: { ease: 'easeInOut' },
  },
}

const deptList = {
  cse: 'COMPUTER SCIENCE',
  is: 'INFORMATION SCIENCE',
  me: 'MECHANICAL ENGINEERING',
  ece: 'ELECTRONICS AND COMMUNICATION',
  civil: 'CIVIL ENGINEERING',
}

const Home = ({ user }) => {
  // Getting User Data
  // const userData = useUser()
  // const { user } = useAuthListner()
  const uid = user?.uid
  const { userData, subLists } = useData(uid)
  console.log(userData, subLists, user)
  //-----States-------
  //Teacher List Data
  // const [subjectList, setSubjectList] = useState(subLists || [])
  const completed = userData?.complete || []
  // const [completed, setCompleted] = useState(userData?.complete || [])
  const [isPwamodal, setIsPwaModal] = useState(false)
  const [isDone, setIsDone] = useState(userData ? userData.status : false)

  // Loading state true means no loading
  const loading = userData && subLists.length

  // Pending Status
  const status = subLists.length - completed.length

  // Function
  //Adding for completed review Toggle Complete
  const addStatus = async () => {
    try {
      await completeStatus(userData?.uid)
      console.log('Succesfully Completed Reviews')
    } catch (error) {
      console.log('Something went wrong!', error)
    }
  }

  //For PWA banner

  const { isStandalone, isInstallPromptSupported, promptInstall } = usePWA()

  const onClickInstall = async () => {
    const didInstall = await promptInstall()
    console.log(didInstall)
    setIsPwaModal(false)
  }

  // Side Effect

  // Complete status
  useEffect(() => {
    if (!isDone && subLists.length && status === 0) {
      addStatus()
    }
  }, [completed, subLists, isDone])

  //Side effect for PWA Banner
  useEffect(() => {
    if (isInstallPromptSupported && !isStandalone) {
      setIsPwaModal(true)
    }
  }, [isInstallPromptSupported])

  return (
    <>
      {loading ? (
        <div className='wrapper home'>
          <motion.div
            variants={usncardVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='usnCard'
          >
            <p className='deptName'>
              DEPARTMENT OF {deptList[userData.branch]}
            </p>
            <p className='usnNumber'>
              <strong>USN :</strong> <span className='usn'>{userData.usn}</span>
            </p>
            <hr />
            <div className='semSec'>
              <p>
                <strong>Sem :</strong> {userData.sem} ,
              </p>
              <p>
                <strong>Sec :</strong> {userData.sec} ,
              </p>
              <p>
                <strong> Branch :</strong> CSE
              </p>
            </div>
            {status === 0 ? (
              <p>
                <strong>Feedback Status :</strong>{' '}
                <span className='status completed'>Completed</span>
              </p>
            ) : (
              <p>
                <strong>Pending Feedback :</strong>{' '}
                <span className='status'>{status}</span>
              </p>
            )}
          </motion.div>
          <motion.div
            variants={wrappercardVariants}
            animate='visible'
            initial='hidden'
            exit='exit'
            className='teacherListCard'
          >
            <h1>Teachers</h1>
            <hr />
            <div className='teacherListWrapper'>
              {subLists.map((subject, i) => (
                <TeacherCard
                  key={i}
                  mark={completed.includes(subject.subcode)}
                  subjectData={subject}
                  uid={userData.uid}
                />
              ))}
            </div>
          </motion.div>
          {isPwamodal && (
            <motion.div
              className='pwaModal'
              variants={pwaVariants}
              initial='hidden'
              whileInView='visible'
              exit='exit'
              viewport={{ once: true }}
            >
              <p>For faster experience Install this App</p>
              <div className='btnDiv'>
                <button
                  className='cancelPwa'
                  onClick={() => setIsPwaModal(false)}
                >
                  Cancel
                </button>
                <button className='installPwa' onClick={onClickInstall}>
                  Install
                </button>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <SkeletonHome />
      )}
    </>
  )
}

export default Home
