import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const LoginPage: React.FC = () => {
    return (
        <div className="max-w-md mx-auto p-4 md:p-8 mt-10">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-center mb-6">Acesso Administrativo</h2>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={[]}
                    theme="light"
                    localization={{
                        variables: {
                            sign_in: {
                                email_label: 'Seu email',
                                password_label: 'Sua senha',
                                email_input_placeholder: 'seu@email.com',
                                password_input_placeholder: 'Sua senha',
                                button_label: 'Entrar',
                                social_provider_text: 'Entrar com {{provider}}',
                                link_text: 'Já tem uma conta? Entre',
                            },
                            sign_up: {
                                email_label: 'Seu email',
                                password_label: 'Sua senha',
                                email_input_placeholder: 'seu@email.com',
                                password_input_placeholder: 'Crie uma senha',
                                button_label: 'Registrar',
                                social_provider_text: 'Registrar com {{provider}}',
                                link_text: 'Não tem uma conta? Registre-se',
                            },
                            forgotten_password: {
                                email_label: 'Seu email',
                                email_input_placeholder: 'seu@email.com',
                                button_label: 'Enviar instruções',
                                link_text: 'Esqueceu sua senha?',
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default LoginPage;