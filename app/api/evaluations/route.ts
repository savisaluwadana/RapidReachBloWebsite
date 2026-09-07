import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluateAgentTrace, type AgentAction } from '@/lib/rapidreach/evaluation/engine'
import { recordUsage } from '@/lib/rapidreach/metering'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      organizationId?: string
      agentName?: string
      agentVersion?: string
      scenarioKey?: string
      actions?: AgentAction[]
    }
    const agentName = body.agentName?.trim() ?? ''
    const scenarioKey = body.scenarioKey?.trim() ?? ''
    if (!agentName || agentName.length > 120) return NextResponse.json({ error: 'agentName is required' }, { status: 400 })
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/i.test(scenarioKey)) return NextResponse.json({ error: 'A valid scenarioKey is required' }, { status: 400 })
    if (!Array.isArray(body.actions) || body.actions.length < 1 || body.actions.length > 100) {
      return NextResponse.json({ error: 'Provide 1-100 agent actions' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    let organizationId: string | null = null
    if (body.organizationId) {
      const { data: membership } = await supabase.from('organization_members').select('id').eq('organization_id', body.organizationId).eq('user_id', user.id).eq('status', 'active').maybeSingle()
      if (!membership) return NextResponse.json({ error: 'Organization access denied' }, { status: 403 })
      organizationId = body.organizationId
    }

    const result = evaluateAgentTrace(body.actions)
    const { data, error } = await supabase.from('agent_evaluations').insert({
      organization_id: organizationId,
      created_by: user.id,
      agent_name: agentName,
      agent_version: body.agentVersion?.trim() || null,
      scenario_key: scenarioKey,
      score: result.score,
      dimensions: result.dimensions,
      unsafe_actions: result.unsafeActions,
      trace: body.actions,
      result: { verdict: result.verdict },
    }).select('id, created_at').single()
    if (error) throw error

    if (organizationId) {
      await recordUsage({ organizationId, userId: user.id, meter: 'agent_evaluations', metadata: { evaluationId: data.id, scenarioKey } })
    }
    return NextResponse.json({ evaluationId: data.id, createdAt: data.created_at, ...result })
  } catch (error) {
    console.error('Agent evaluation failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Evaluation failed' }, { status: 500 })
  }
}
