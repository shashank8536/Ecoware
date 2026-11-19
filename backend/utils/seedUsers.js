import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const seedUsers = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecoware'
    await mongoose.connect(mongoUri)
    console.log('[Seed] Connected to MongoDB...')

    await User.deleteMany({
      email: {
        $in: [
          'rohit.sharma@example.com',
          'rajesh.kumar@ecoware.gov.in',
          'admin@ecoware.gov.in',
        ],
      },
    })
    console.log('[Seed] Cleared existing demo users...')

    const citizen = await User.create({
      fullName: 'Rohit Sharma',
      email: 'rohit.sharma@example.com',
      password: 'Password123',
      phone: '98765 43210',
      role: 'CITIZEN',
      citizenId: 'ECW-CIT-0001042',
      gender: 'Male',
      houseStreet: '42, Rose Villa Apartments, 4th Cross, MG Road',
      locality: 'Lotus Avenue',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      ward: 'Ward 8',
      emailVerified: true,
    })

    const staff = await User.create({
      fullName: 'Rajesh Kumar',
      email: 'rajesh.kumar@ecoware.gov.in',
      password: 'Staff@123',
      phone: '+91 98765 43210',
      role: 'STAFF',
      staffId: 'STF-001',
      designation: 'Waste Collection Staff',
      ward: 'Ward 02',
      gender: 'Male',
      department: 'Sanitation & Solid Waste Management',
      assignedVehicle: 'WT-04 (Electric Compactor Truck)',
      depotBase: 'Ward 2 Central Depot, Bay 4',
      shiftTimings: '07:00 AM – 03:30 PM (Mon – Sat)',
      supervisor: 'Vikram Patil (Field Operations Officer)',
    })

    const admin = await User.create({
      fullName: 'EcoWare Administrator',
      email: 'admin@ecoware.gov.in',
      password: 'Admin@123',
      phone: '+91 99999 88888',
      role: 'ADMIN',
      staffId: 'ADM-001',
      designation: 'Municipal Operations Lead',
      department: 'Municipal Administration',
    })

    console.log('\n=============================================')
    console.log('   EcoWare Auth Seeder Completed Successfully')
    console.log('=============================================')
    console.log(`[Citizen] ${citizen.email}  | Password: Password123 | Role: ${citizen.role}`)
    console.log(`[Staff]   ${staff.email}    | Password: Staff@123   | Role: ${staff.role}`)
    console.log(`[Admin]   ${admin.email}    | Password: Admin@123   | Role: ${admin.role}`)
    console.log('=============================================\n')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('[Seed Error]:', error)
    process.exit(1)
  }
}

seedUsers()
