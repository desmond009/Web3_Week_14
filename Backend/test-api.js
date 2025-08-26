import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testAPI() {
    console.log('🧪 Testing Web3 Authentication API...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        console.log('');

        // Test signup
        console.log('2. Testing user signup...');
        const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                walletAddress: '0x1234567890abcdef'
            })
        });
        const signupData = await signupResponse.json();
        
        if (signupData.success) {
            console.log('✅ Signup successful:', signupData.message);
            console.log('👤 User:', signupData.user.username);
            console.log('🔑 Token received');
            console.log('');
            
            const token = signupData.token;
            
            // Test signin
            console.log('3. Testing user signin...');
            const signinResponse = await fetch(`${BASE_URL}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            });
            const signinData = await signinResponse.json();
            
            if (signinData.success) {
                console.log('✅ Signin successful:', signinData.message);
                console.log('👤 User:', signinData.user.username);
                console.log('');
                
                // Test protected route
                console.log('4. Testing protected transaction route...');
                const txnResponse = await fetch(`${BASE_URL}/txn`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const txnData = await txnResponse.json();
                console.log('✅ Protected route access:', txnData.message);
                console.log('👤 Authenticated user:', txnData.user.username);
                console.log('');
                
                // Test transaction signing
                console.log('5. Testing transaction signing...');
                const signTxnResponse = await fetch(`${BASE_URL}/txn/sign`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionData: 'sample_transaction_data'
                    })
                });
                const signTxnData = await signTxnResponse.json();
                console.log('✅ Transaction signing:', signTxnData.message);
                console.log('👤 Authenticated user:', signTxnData.user.username);
                
            } else {
                console.log('❌ Signin failed:', signinData.message);
            }
            
        } else {
            console.log('❌ Signup failed:', signupData.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
    }
}

// Run the test
testAPI(); 