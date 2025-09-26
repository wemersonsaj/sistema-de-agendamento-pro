/// <reference types="https://esm.sh/@types/deno" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Garante que apenas um usuário logado possa chamar esta função
    await verifyUser(req);

    // Cria um cliente Supabase com privilégios de administrador
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, password } = await req.json()

    if (!userId) {
        throw new Error("O ID do usuário é obrigatório.")
    }

    // Lida com a exclusão de usuário
    if (req.method === 'DELETE') {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } 
    // Lida com a alteração de senha
    else if (req.method === 'PUT') {
        if (!password) {
            throw new Error("A nova senha é obrigatória.")
        }
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: password }
        )
        if (updateError) throw updateError
        return new Response(JSON.stringify({ message: 'Senha alterada com sucesso' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } 
    // Rejeita outros métodos HTTP
    else {
        return new Response(JSON.stringify({ error: 'Método não permitido' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 405,
        })
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})