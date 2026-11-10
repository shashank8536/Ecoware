export const initialStaffProfile = {
  // 1. Header & ID
  staffId: 'STF-001',
  fullName: 'Rajesh Kumar',
  designation: 'Waste Collection Staff',
  role: 'Senior Waste Collection Specialist',
  ward: 'Ward 02',
  status: 'Active',
  avatar: '',

  // 2. Personal Information (Editable)
  email: 'rajesh.kumar@ecoware.gov.in',
  phone: '+91 98765 43210',
  dob: '1992-08-15',
  gender: 'Male',
  houseStreet: 'Quarter No. 42, Municipal Staff Colony',
  city: 'New Delhi',
  state: 'Delhi',
  pinCode: '110016',

  // 3. Work Information (Read-only)
  department: 'Sanitation & Solid Waste Management',
  joiningDate: '15 March 2023',
  employmentStatus: 'Full-Time (Permanent)',
  shiftTimings: '07:00 AM – 03:30 PM (Mon – Sat)',
  assignedVehicle: 'WT-04 (Electric Compactor Truck)',
  depotBase: 'Ward 2 Central Depot, Bay 4',
  supervisor: 'Vikram Patil (Field Operations Officer)',

  // 7. Account Information
  accountCreated: '15 March 2023',
  lastUpdated: '10 November 2026',
}

export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say']
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
