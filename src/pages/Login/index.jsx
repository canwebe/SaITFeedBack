import React, { useRef, useState, useEffect } from 'react'
import { auth, db } from '../../lib/firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore'
import useAuthListner from '../../hooks/useAuthListner'
import './login.style.css'
import { updateInfo } from '../../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Modal from '../../components/modal'

const containerVariants = {
  hidden: {
    y: '-80vh',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      mass: 0.5,
      damping: 9,
    },
  },

  exit: {
    y: '80vh',
    transition: { ease: 'easeInOut' },
  },
}

const Login = () => {
  const [inputData, setInputData] = useState({
    usn: '',
    branch: '',
    otp: '',
  })
  // const [usn, setUsn] = useState('')
  // const [branch, setBranch] = useState('')
  // const [otp, setOtp] = useState('')
  const [final, setFinal] = useState()
  const [show, setShow] = useState(false)
  const [userData, setUserData] = useState({})
  const [error, setError] = useState('')
  const [succes, setSucces] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModal, setIsModal] = useState(false)

  const inputRef = useRef()
  const { usn, branch, otp } = inputData
  const { user } = useAuthListner()
  const navigate = useNavigate()
  // const no = useUser();
  let pno = ''

  console.log(usn, branch, otp)
  const isValid = usn === '' || usn.length < 10 || branch === ''
  const otpInvalid = otp === '' || otp.length < 6

  //Handling Inputs
  const handleChange = (e) => {
    const { name, value } = e.target

    setError('')
    setSucces('')
    setInputData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Give Notice Modal
  const handleModal = (e) => {
    e.preventDefault()
    setIsModal(true)
  }
  // Submit
  const handleSubmit = async (e) => {
    // e.preventDefault()
    setLoading(true)
    console.log(usn)
    const q = query(
      collection(db, 'cse'),
      where('usn', '==', usn.trim().toUpperCase())
    )
    const snapshot = await getDocs(q)
    snapshot.forEach((doc) => {
      // console.log(doc.data());
      setUserData(doc.data())
      pno = doc.data().number
    })

    //If Phone Number Found
    if (pno) {
      console.log('Phone Number Found')
      let verify = new RecaptchaVerifier('captcha', { size: 'invisible' }, auth)
      signInWithPhoneNumber(auth, '+91' + pno, verify)
        .then((confirm) => {
          setLoading(false)
          console.log('Otp Sent')
          setError('')
          setSucces(
            `OTP sent to the phone number ending with +91 XXXXXXXX${pno.slice(
              -2
            )}`
          )
          setFinal(confirm)
          setShow(true)
          inputRef.current.focus()
        })
        .catch((err) => {
          setLoading(false)
          console.log(err)
          setUserData({
            usn: '',
            branch: '',
            otp: '',
          })
          setError('Something went wrong , Try Again!')
          window.location.reload()
        })
    } else {
      setLoading(false)
      console.log(userData, pno)
      setSucces('')
      setError('No info found USN incorrect , please try again')
    }
  }

  // Verify
  const handleVerify = (e) => {
    e.preventDefault()
    setLoading(true)
    if (otp === null || final === null) return
    final
      .confirm(otp)
      .then((result) => {
        console.log(result.user.uid)
        updateInfo(result.user.uid, usn)
        setLoading(false)
        navigate('/')
        window.grecaptcha = null
        window.recaptcha = null
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)

        setInputData({
          usn: '',
          branch: '',
          otp: '',
        })
        setSucces('')
        setError('Verification failed OTP did not matched Try Again !!')
      })
  }

  // SignOut
  const handleSignout = () => {
    signOut(auth)
      .then(() => {
        console.log('Signout Succes')
      })
      .catch((err) => {
        console.log('Signout error', err)
      })
  }

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user])

  return (
    <div className='loginDiv'>
      <motion.div
        variants={containerVariants}
        animate='visible'
        initial='hidden'
        exit='exit'
        className='wrapper login'
      >
        <form>
          {error && <p className='errorMsg'>{error}</p>}
          {succes && <p className='succesMsg'>{succes}</p>}
          <h2>Authentication</h2>
          {show ? (
            <>
              <div className='formDiv'>
                <input
                  name='otp'
                  ref={inputRef}
                  className='formInput'
                  placeholder=' '
                  value={otp}
                  maxLength='6'
                  required
                  onChange={handleChange}
                />
                <label className='formLabel'>Enter OTP</label>
              </div>

              <button
                onClick={handleVerify}
                className={`btn ${otpInvalid ? 'disabled' : ''}`}
                disabled={otpInvalid || loading}
              >
                {loading ? 'loading...' : 'Verify'}
              </button>
              <p className='captchaText'>Hidden Auto ReCaptcha Verifier</p>
            </>
          ) : (
            <>
              <div className='formDiv'>
                <select
                  required
                  onChange={handleChange}
                  name='branch'
                  value={branch}
                >
                  <option value=''>Select Your Branch</option>
                  <option value='basic'>BASIC</option>
                  <option value='cse'>CSE</option>
                  <option value='is'>IS</option>
                  <option value='me'>ME</option>
                  <option value='ece'>ECE</option>
                  <option value='civ'>CIVIL</option>
                </select>
                {/* <label className='formLabel'>Select Your Branch</label> */}
              </div>
              <div className='formDiv'>
                <input
                  name='usn'
                  className='formInput'
                  placeholder=' '
                  value={usn}
                  required
                  maxLength='10'
                  autoComplete='off'
                  onChange={handleChange}
                />
                <label className='formLabel'>Enter Your USN</label>
              </div>

              <div id='captcha' className='captcha'></div>

              <button
                onClick={handleModal}
                className={`btn ${isValid ? 'disabled' : ''}`}
                disabled={isValid || loading}
              >
                {loading ? 'Sending Code...' : 'Next'}
              </button>
              <p className='captchaText'>Hidden Auto ReCaptcha Verifier</p>
            </>
          )}
        </form>

        {/* <button onClick={() => studentWithUid("abc")}>Update</button> */}
        {/* <button className="signOut" onClick={handleSignout}>
        SignOut---Only for testing
      </button> */}
      </motion.div>
      <AnimatePresence>
        {isModal && (
          <Modal setIsModal={setIsModal} handleSubmit={handleSubmit} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
