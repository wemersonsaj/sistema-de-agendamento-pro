// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para verificar se o usuário que está fazendo a chamada é um usuário autenticado
async function verifyUser(req: Request) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Cabeçalho de autenticação ausente')
    }
    const jwt = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    )
    const { data: { user }, error } = await supabaseClient.auth.getUser(jwt)
    if (error || !user) {
        throw new Error('Não autorizado')
    }
    return user;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Garante que apenas um usuário logado possa chamar esta função
    await verifyUser(req);

    // Cria um cliente Supabase com privilégios de administrador para listar os usuários
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ users: data.users }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})