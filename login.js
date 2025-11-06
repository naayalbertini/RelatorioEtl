// ** ATENÇÃO: SUBSTITUA PELAS SUAS CREDENCIAIS REAIS DO FIREBASE **
// Substitua ESTE BLOCO pelo que você copiou do Console
const firebaseConfig = {
    apiKey: "AIzaSyCchixFInasRgOlmjPEafVYwVlGSqkqMIg", 
    authDomain: "geradorrelatoriosescola.firebaseapp.com",
    projectId: "geradorrelatoriosescola",
    storageBucket: "geradorrelatoriosescola.firebasestorage.app",
    messagingSenderId: "286288216743",
    appId: "1:286288216743:web:52ac6a1f23cdb7a4c91182"
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();

// ----------------------------------------------------------------------
// 1. OBTENÇÃO DOS ELEMENTOS DO HTML
// ----------------------------------------------------------------------

// Elementos da Tela de Login
const loginButton = document.getElementById('loginButton');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageElement = document.getElementById('errorMessage');

// Elementos das Telas (para gerenciar a transição)
const loginFormContent = document.getElementById('loginFormContent');
const recoveryFormContent = document.getElementById('recoveryFormContent');

// Elementos da Tela de Recuperação
const recoveryEmailInput = document.getElementById('recoveryEmail');
const sendResetEmailButton = document.getElementById('sendResetEmailButton');
const backToLoginButton = document.getElementById('backToLoginButton');
const recoveryMessageElement = document.getElementById('recoveryMessage');

// Função utilitária para limpar e configurar a mensagem
function setupMessage(element, message, isSuccess = false) {
    element.textContent = message;
    element.classList.remove('d-none');
    
    // Remove as classes de ambas as cores para garantir a correta
    element.classList.remove('alert-danger', 'alert-success');
    
    if (isSuccess) {
        element.classList.add('alert-success');
    } else {
        element.classList.add('alert-danger');
    }
}

// ----------------------------------------------------------------------
// 2. LÓGICA DE LOGIN
// ----------------------------------------------------------------------

loginButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    
    const email = emailInput.value;
    const password = passwordInput.value;

    setupMessage(errorMessageElement, '', false); // Limpa mensagens

    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
            return auth.signInWithEmailAndPassword(email, password);
        })
        .then((userCredential) => {
            // Login bem-sucedido!
            window.location.href = 'index.html';
        })
        .catch((error) => {
            let message;
            
            switch(error.code) {
                case 'auth/user-not-found':
                    message = 'Usuário não encontrado. Verifique o e-mail.';
                    break;
                case 'auth/wrong-password':
                    message = 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    message = 'E-mail inválido.';
                    break;
                default:
                    message = 'Erro ao fazer login. Tente novamente.';
                    console.error(error);
            }
            
            setupMessage(errorMessageElement, message, false);
        });
});

// ----------------------------------------------------------------------
// 3. LÓGICA DE TRANSIÇÃO DE TELAS
// ----------------------------------------------------------------------

// Ação: Clicar em "Esqueceu a senha?" (Vai para a Tela de Recuperação)
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();

    // Limpa o campo de e-mail principal e transfere o valor para o campo de recuperação (melhora a UX)
    recoveryEmailInput.value = emailInput.value;
    emailInput.value = '';

    // Limpa mensagens de erro e mostra a tela de recuperação
    errorMessageElement.classList.add('d-none');
    recoveryMessageElement.classList.add('d-none');
    
    loginFormContent.classList.add('d-none');
    recoveryFormContent.classList.remove('d-none');
});

// Ação: Clicar em "Voltar ao Login"
backToLoginButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Limpa o campo de e-mail de recuperação
    recoveryEmailInput.value = '';
    
    // Limpa mensagens de erro e mostra a tela de login
    errorMessageElement.classList.add('d-none');
    recoveryMessageElement.classList.add('d-none');

    recoveryFormContent.classList.add('d-none');
    loginFormContent.classList.remove('d-none');
});


// ----------------------------------------------------------------------
// 4. LÓGICA DE ENVIO DO E-MAIL DE REDEFINIÇÃO (NOVA POSIÇÃO)
// ----------------------------------------------------------------------

sendResetEmailButton.addEventListener('click', (e) => {
    e.preventDefault();

    const email = recoveryEmailInput.value;

    setupMessage(recoveryMessageElement, '', false); // Limpa mensagens

    // 1. Verifica se o campo de e-mail está preenchido
    if (!email) {
        setupMessage(recoveryMessageElement, 'Por favor, digite seu e-mail para redefinir a senha.', false);
        return; 
    }

    // 2. Envia o e-mail de redefinição usando a função do Firebase
    auth.sendPasswordResetEmail(email)
        .then(() => {
            // Sucesso
            setupMessage(recoveryMessageElement, 
                `Um link de redefinição de senha foi enviado para o e-mail: ${email}. Verifique sua caixa de entrada e spam.`, 
                true
            );
            
            // Limpa o campo após o sucesso
            recoveryEmailInput.value = '';

        })
        .catch((error) => {
            // Erro 
            let message = 'Ocorreu um erro ao tentar redefinir a senha. Tente novamente.';
            
            if (error.code === 'auth/user-not-found') {
                message = 'Não existe usuário cadastrado com este e-mail.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'O formato do e-mail é inválido.';
            }

            setupMessage(recoveryMessageElement, message, false);
            console.error(error);
        });
});