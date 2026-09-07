import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLabEnvironment, deleteLabEnvironment, labsConfigured } from '@/lib/rapidreach/labs/kubernetes'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    if (!labsConfigured()) return NextResponse.json({ error: 'Lab cluster is not configured' }, { status: 503 })
    const body = await request.json() as { scenarioKey?: string; organizationId?: string; ttlMinutes?: number }
    if (!body.scenarioKey || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(body.scenarioKey)) {
      return NextResponse.json({ error: 'A valid scenarioKey is required' }, { status: 400 })
    }
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    if (body.organizationId) {
      const { data: membership } = await supabase.from('organization_members').select('id').eq('organization_id', body.organizationId).eq('user_id', user.id).eq('status', 'active').maybeSingle()
      if (!membership) return NextResponse.json({ error: 'Organization access denied' }, { status: 403 })
    }

    const environment = await createLabEnvironment({ scenarioKey: body.scenarioKey, ttlMinutes: body.ttlMinutes })
    const { data: run, error } = await supabase.from('lab_runs').insert({
      organization_id: body.organizationId ?? null,
      user_id: user.id,
      scenario_key: body.scenarioKey,
      run_type: 'human',
      status: 'environment_ready',
      result: { environment },
    }).select('id').single()
    if (error) {
      await deleteLabEnvironment(environment.namespace).catch(() => undefined)
      throw error
    }
    return NextResponse.json({ runId: run.id, ...environment })
  } catch (error) {
    console.error('Lab provisioning failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lab provisioning failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as { runId?: string; namespace?: string }
    if (!body.runId || !body.namespace) return NextResponse.json({ error: 'runId and namespace are required' }, { status: 400 })
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const { data: run } = await supabase.from('lab_runs').select('id').eq('id', body.runId).eq('user_id', user.id).maybeSingle()
    if (!run) return NextResponse.json({ error: 'Lab run not found' }, { status: 404 })
    await deleteLabEnvironment(body.namespace)
    await supabase.from('lab_runs').update({ status: 'terminated', completed_at: new Date().toISOString() }).eq('id', body.runId)
    return NextResponse.json({ terminated: true })
  } catch (error) {
    console.error('Lab termination failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Lab termination failed' }, { status: 500 })
  }
}
