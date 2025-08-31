import { useState } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import axios from 'axios'
import './App.css'

const fromPublicKey = new PublicKey("3Vt99fM2RbJwNEqKD6f3YSj4di9Z4koe8KR6YJ6x1eST")

function App() {
  const [count, setCount] = useState(0)

  const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/6mFCPorjtiIGk-WlzevtyUEXl0xHqseb")

  async function sendSol(){
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


    const response = await axios.post("/api/v1/txn/sign", {
      message: serializedTx,
      retry: false,
    })

    console.log(response)
  }


  return (
    <>
      <input type="text" placeholder="Amount" />
      <input type="text" placeholder="Wallet Address" />
      <button onClick={sendSol}>Donate</button>
    </>
  )
}

export default App
