import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { inMemoryDb, pool, isPostgresConnected } from '../config/db.js'
import { User, FarmerProfile, BuyerProfile, UserRole } from '../models/types.js'
import { isValidState, isValidDistrictForState } from '../data/indiaLocations.js'

export class AuthService {
  static async register(data: {
    email: string
    password: string
    name: string
    phone: string
    user_type: UserRole
    location: string
    district?: string
    state?: string
    organization?: string
    fpo_name?: string
    company_name?: string
    gst_number?: string
  }) {
    const existing = inMemoryDb.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())
    if (existing) {
      throw new Error('An account with this email address already exists.')
    }

    // Validate State and District combination
    if (data.state && !isValidState(data.state)) {
      throw new Error(`Invalid state: "${data.state}" is not a recognized Indian State or Union Territory.`)
    }
    if (data.state && data.district && !isValidDistrictForState(data.state, data.district)) {
      throw new Error(`Invalid location: "${data.district}" is not a recognized district of ${data.state}.`)
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const userId = `USR-${data.user_type.substring(0, 3)}-${Date.now().toString().slice(-4)}`
    const now = new Date().toISOString()

    const newUser: User = {
      id: userId,
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      name: data.name,
      phone: data.phone,
      user_type: data.user_type,
      location: data.location,
      district: data.district || 'Harda',
      state: data.state || 'Madhya Pradesh',
      status: 'Active',
      kyc_verified: false,
      organization: data.organization || data.fpo_name || data.company_name,
      created_at: now,
      updated_at: now,
    }

    inMemoryDb.users.push(newUser)

    let createdProfile: FarmerProfile | BuyerProfile | null = null

    if (data.user_type === 'FARMER') {
      const farmerProfile: FarmerProfile = {
        id: `PRF-FRM-${Date.now().toString().slice(-4)}`,
        user_id: userId,
        fpo_name: data.fpo_name || data.organization,
        fpo_role: 'Producer Member',
        total_land_acres: 10,
        kisan_credit_card_verified: false,
        bank_account_masked: 'SBI •••• 1234',
        upi_id: `${data.name.toLowerCase().replace(/\s+/g, '.')}@sbi`,
        village: data.location,
        district: data.district || 'Harda',
        state: data.state || 'Madhya Pradesh',
        created_at: now,
        updated_at: now,
      }
      inMemoryDb.farmerProfiles.push(farmerProfile)
      createdProfile = farmerProfile
    } else if (data.user_type === 'BUYER') {
      const buyerProfile: BuyerProfile = {
        id: `PRF-BUY-${Date.now().toString().slice(-4)}`,
        user_id: userId,
        company_name: data.company_name || data.organization || data.name,
        gst_number: data.gst_number || '23AAACA0000A1Z0',
        delivery_location: data.location,
        verified: true,
        reliability_score: 4.85,
        max_budget_inr: 2000000,
        created_at: now,
        updated_at: now,
      }
      inMemoryDb.buyerProfiles.push(buyerProfile)
      createdProfile = buyerProfile
    }

    // Persist to PostgreSQL if connected
    if (isPostgresConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO users (id, email, password_hash, name, phone, user_type, location, district, state, status, kyc_verified, organization)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [newUser.id, newUser.email, newUser.password_hash, newUser.name, newUser.phone, newUser.user_type, newUser.location, newUser.district, newUser.state, newUser.status, newUser.kyc_verified, newUser.organization]
        )
      } catch (e) {
        console.warn('[AuthService] PostgreSQL insert failed, fallback to memory', e)
      }
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        user_type: newUser.user_type,
        organization: newUser.organization,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    const { password_hash, ...safeUser } = newUser
    return { token, user: safeUser, profile: createdProfile }
  }

  static async login(email: string, password: string) {
    const user = inMemoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user || !user.password_hash) {
      throw new Error('Invalid email or password.')
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new Error('Invalid email or password.')
    }

    if (user.status === 'Suspended') {
      throw new Error('This account has been administratively suspended. Please contact operations support.')
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        organization: user.organization,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    let profile = null
    if (user.user_type === 'FARMER') {
      profile = inMemoryDb.farmerProfiles.find(p => p.user_id === user.id)
    } else if (user.user_type === 'BUYER') {
      profile = inMemoryDb.buyerProfiles.find(p => p.user_id === user.id)
    }

    const { password_hash, ...safeUser } = user
    return { token, user: safeUser, profile }
  }

  static async getCurrentUser(userId: string) {
    const user = inMemoryDb.users.find(u => u.id === userId)
    if (!user) {
      throw new Error('User not found.')
    }

    let profile = null
    if (user.user_type === 'FARMER') {
      profile = inMemoryDb.farmerProfiles.find(p => p.user_id === user.id)
    } else if (user.user_type === 'BUYER') {
      profile = inMemoryDb.buyerProfiles.find(p => p.user_id === user.id)
    }

    const { password_hash, ...safeUser } = user
    return { user: safeUser, profile }
  }

  static async updateProfile(userId: string, data: any) {
    const user = inMemoryDb.users.find(u => u.id === userId)
    if (!user) {
      throw new Error('User not found.')
    }

    const stateToValidate = data.state || user.state
    const districtToValidate = data.district || user.district

    if (data.state && !isValidState(data.state)) {
      throw new Error(`Invalid state: "${data.state}" is not a recognized Indian State or Union Territory.`)
    }
    if ((data.state || data.district) && !isValidDistrictForState(stateToValidate, districtToValidate)) {
      throw new Error(`Invalid location: "${districtToValidate}" is not a recognized district of ${stateToValidate}.`)
    }

    if (data.name) user.name = data.name
    if (data.phone) user.phone = data.phone
    if (data.location) user.location = data.location
    if (data.district) user.district = data.district
    if (data.state) user.state = data.state
    if (data.organization) user.organization = data.organization
    user.updated_at = new Date().toISOString()

    let profile = null
    if (user.user_type === 'FARMER') {
      profile = inMemoryDb.farmerProfiles.find(p => p.user_id === user.id)
      if (profile) {
        if (data.fpo_name) profile.fpo_name = data.fpo_name
        if (data.total_land_acres !== undefined) profile.total_land_acres = Number(data.total_land_acres)
        if (data.village) profile.village = data.village
        if (data.upi_id) profile.upi_id = data.upi_id
        profile.updated_at = new Date().toISOString()
      }
    } else if (user.user_type === 'BUYER') {
      profile = inMemoryDb.buyerProfiles.find(p => p.user_id === user.id)
      if (profile) {
        if (data.company_name) profile.company_name = data.company_name
        if (data.gst_number) profile.gst_number = data.gst_number
        if (data.delivery_location) profile.delivery_location = data.delivery_location
        profile.updated_at = new Date().toISOString()
      }
    }

    const { password_hash, ...safeUser } = user
    return { user: safeUser, profile }
  }
}

