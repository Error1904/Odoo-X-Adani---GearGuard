import { supabase } from './supabase'

export async function checkDatabaseHealth() {
  const results = {
    connection: false,
    tables: {
      teams: false,
      profiles: false,
      equipment: false,
      maintenance_requests: false,
    },
    errors: [] as string[],
  }

  try {
    // Test connection by checking teams table
    console.log('🔍 Checking teams table...')
    const { error: teamsError } = await supabase
      .from('teams')
      .select('count')
      .limit(1)

    if (teamsError) {
      console.error('❌ Teams table error:', teamsError)
      results.errors.push(`Teams: ${teamsError.message}`)
    } else {
      console.log('✅ Teams table accessible')
      results.tables.teams = true
    }

    // Test profiles
    console.log('🔍 Checking profiles table...')
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError)
      results.errors.push(`Profiles: ${profilesError.message}`)
    } else {
      console.log('✅ Profiles table accessible')
      results.tables.profiles = true
    }

    // Test equipment
    console.log('🔍 Checking equipment table...')
    const { error: equipmentError } = await supabase
      .from('equipment')
      .select('count')
      .limit(1)

    if (equipmentError) {
      console.error('❌ Equipment table error:', equipmentError)
      results.errors.push(`Equipment: ${equipmentError.message}`)
    } else {
      console.log('✅ Equipment table accessible')
      results.tables.equipment = true
    }

    // Test maintenance_requests
    console.log('🔍 Checking maintenance_requests table...')
    const { error: requestsError } = await supabase
      .from('maintenance_requests')
      .select('count')
      .limit(1)

    if (requestsError) {
      console.error('❌ Maintenance requests table error:', requestsError)
      results.errors.push(`Maintenance Requests: ${requestsError.message}`)
    } else {
      console.log('✅ Maintenance requests table accessible')
      results.tables.maintenance_requests = true
    }

    // Test insert permission on teams
    console.log('🔍 Testing insert on teams table...')
    const { data: insertTest, error: insertError } = await (supabase as any)
      .from('teams')
      .insert({ name: '__test_team__' })
      .select()

    if (insertError) {
      console.error('❌ Cannot insert to teams:', insertError)
      results.errors.push(`Insert Teams: ${insertError.message}`)
    } else {
      console.log('✅ Can insert to teams table')

      // Clean up test data
      if (insertTest && insertTest[0]) {
        await supabase
          .from('teams')
          .delete()
          .eq('name', '__test_team__')
        console.log('🧹 Cleaned up test data')
      }
    }

    results.connection = results.errors.length === 0

  } catch (error) {
    console.error('❌ Database health check failed:', error)
    results.errors.push(`General: ${error}`)
  }

  return results
}

export async function testTeamCreation() {
  console.log('🧪 Testing team creation...')

  try {
    const testTeamName = `Test Team ${Date.now()}`
    console.log('Creating:', testTeamName)

    const { data, error } = await (supabase as any)
      .from('teams')
      .insert({ name: testTeamName })
      .select()

    if (error) {
      console.error('❌ Error:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Success:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Exception:', error)
    return { success: false, error: String(error) }
  }
}
