import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAppContext } from '../context/AppContext';

const LoginPage: React.FC = () => {
    const { settings } = useAppContext();

    if (!settings) return null;

    return (
        <div className="min-h-[calc(100vh-81px)] flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Acessar o painel de Admin
                    </h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: settings.visuals.primaryColor,
                                        brandAccent: `color-mix(in srgb, ${settings.visuals.primaryColor} 90%, black)`,
                                    },
                                },
                            },
                        }}
                        providers={[]}
                        theme="light"
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Endereço de e-mail',
                                    password_label: 'Senha',
                                    email_input_placeholder: 'Seu e-mail',
                                    password_input_placeholder: 'Sua senha',
                                    button_label: 'Entrar',
                                    social_provider_text: 'Entrar com {{provider}}',
                                    link_text: 'Já tem uma conta? Entre',
                                },
                                sign_up: {
                                    email_label: 'Endereço de e-mail',
                                    password_label: 'Senha',
                                    button_label: 'Registrar',
                                    link_text: 'Não tem uma conta? Registre-se',
                                },
                                magic_link: {
                                    email_input_label: 'Endereço de e-mail',
                                    email_input_placeholder: 'Seu endereço de e-mail',
                                    button_label: 'Enviar link mágico',
                                    link_text: 'Enviar um link mágico por e-mail',
                                },
                                forgotten_password: {
                                    email_label: 'Endereço de e-mail',
                                    password_label: 'Sua senha',
                                    button_label: 'Enviar instruções de recuperação',
                                    link_text: 'Esqueceu sua senha?',
                                },
                                update_password: {
                                    password_label: 'Nova senha',
                                    password_input_placeholder: 'Sua nova senha',
                                    button_label: 'Atualizar senha',
                                }
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;