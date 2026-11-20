import { server } from '../server.js'

const BASE_URL = 'http://localhost:5000/api/auth'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runTests() {
  console.log('\n--- Starting EcoWare Security & Auth Test Suite ---\n')
  await sleep(1500)

  let testsPassed = 0
  let testsFailed = 0

  const assert = (condition, title) => {
    if (condition) {
      console.log(`PASS: ${title}`)
      testsPassed++
    } else {
      console.error(`FAIL: ${title}`)
      testsFailed++
    }
  }

  try {
    const healthRes = await fetch('http://localhost:5000/api/health')
    const healthJson = await healthRes.json()
    assert(healthRes.status === 200 && healthJson.status === 'online', 'Server health endpoint is online')

    const randomSuffix = Date.now().toString().slice(-4)
    const newCitizenEmail = `test.citizen${randomSuffix}@example.com`
    const registerRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Sharma',
        email: newCitizenEmail,
        phone: '9876543210',
        password: 'Password123',
        ward: 'Ward 4',
      }),
    })
    const registerJson = await registerRes.json()
    assert(registerRes.status === 201 && registerJson.token, 'New Citizen registration generates valid JWT token')
    assert(registerJson.user.role === 'CITIZEN', 'Registered user has CITIZEN role')

    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohit.sharma@example.com',
        password: 'Password123',
      }),
    })
    const loginJson = await loginRes.json()
    assert(loginRes.status === 200 && loginJson.token, 'Demo Citizen login succeeds and returns token')
    const citizenToken = loginJson.token

    const staffLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rajesh.kumar@ecoware.gov.in',
        password: 'Staff@123',
      }),
    })
    const staffLoginJson = await staffLoginRes.json()
    assert(staffLoginRes.status === 200 && staffLoginJson.user.role === 'STAFF', 'Demo Staff login succeeds and identifies STAFF role')
    const staffToken = staffLoginJson.token

    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    })
    const meJson = await meRes.json()
    assert(meRes.status === 200 && meJson.user.email === 'rohit.sharma@example.com', 'Token authentication resolves current user profile')

    const unauthRes = await fetch(`${BASE_URL}/me`)
    assert(unauthRes.status === 401, 'Request without token is rejected with 401 Unauthorized')

    const citizenAccessRes = await fetch(`${BASE_URL}/citizen-only`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    })
    assert(citizenAccessRes.status === 200, 'Citizen can access Citizen-protected resource')

    const citizenDeniedRes = await fetch(`${BASE_URL}/staff-only`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    })
    assert(citizenDeniedRes.status === 403, 'Citizen blocked from Staff-protected resource (403 Forbidden)')

    const staffAccessRes = await fetch(`${BASE_URL}/staff-only`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
    assert(staffAccessRes.status === 200, 'Staff can access Staff-protected resource')

    const staffDeniedRes = await fetch(`${BASE_URL}/citizen-only`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
    assert(staffDeniedRes.status === 403, 'Staff blocked from Citizen-protected resource (403 Forbidden)')

    const invalidLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rohit.sharma@example.com',
        password: 'WrongPassword999',
      }),
    })
    assert(invalidLoginRes.status === 401, 'Invalid password is systematically rejected with 401 Unauthorized')

    console.log('\n=============================================')
    console.log(`Tests Completed: ${testsPassed} Passed, ${testsFailed} Failed`)
    console.log('=============================================\n')
  } catch (error) {
    console.error('Test execution error:', error)
  } finally {
    server.close(() => {
      process.exit(testsFailed === 0 ? 0 : 1)
    })
  }
}

runTests()
