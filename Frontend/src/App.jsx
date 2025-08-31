import { useState } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import axios from 'axios'
import './App.css'


const fromPublicKey = new PublicKey("3Vt99fM2RbJwNEqKD6f3YSj4di9Z4koe8KR6YJ6x1eST")

function App() {
  const [count, setCount] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)

  const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/6mFCPorjtiIGk-WlzevtyUEXl0xHqseb")

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/signup', {
        username: email.split('@')[0],
        email,
        password,
        walletAddress: fromPublicKey.toString()
      })
      
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        setIsAuthenticated(true)
        alert('Signup successful!')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('Signup failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleSignin = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/signin', {
        email,
        password
      })
      
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        setIsAuthenticated(true)
        alert('Signin successful!')
      }
    } catch (error) {
      console.error('Signin error:', error)
      alert('Signin failed: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  async function sendSol(){
    if (!token) {
      alert('Please authenticate first')
      return
    }

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: new PublicKey("C9yp6AGPBnCFj1zB8Y4rBEdb7cdduQWNrCcc7XbcjiCA"),
        lamports: 0.001 * LAMPORTS_PER_SOL,
      })
    )


    // Get the recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    tx.recentBlockhash = blockhash;
    tx.feePayer = fromPublicKey;

    
    // Convert the transaction to bytes and send to the backend
    const serializedTx = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    })

    console.log(serializedTx)

    try {
      const response = await axios.post("http://localhost:3000/api/v1/txn/sign", {
        message: serializedTx,
        retry: false,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log(response.data)
      alert('Transaction successful! Signature: ' + response.data.signature)
    } catch (error) {
      console.error('Transaction error:', error)
      alert('Transaction failed: ' + (error.response?.data?.message || error.message))
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h2>Authentication</h2>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSignup} style={{ flex: 1, padding: '8px' }}>Signup</button>
          <button onClick={handleSignin} style={{ flex: 1, padding: '8px' }}>Signin</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Donation App</h2>
        <button onClick={handleLogout} style={{ padding: '8px' }}>Logout</button>
      </div>
      <input type="text" placeholder="Amount" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <input type="text" placeholder="Wallet Address" style={{ width: '100%', marginBottom: '10px', padding: '8px' }} />
      <button onClick={sendSol} style={{ width: '100%', padding: '8px' }}>Donate</button>
    </div>
  )
}

export default App
