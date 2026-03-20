// Integración con AWS Cognito para registro, login y gestión de sesiones

import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

// Configuración del User Pool con variables de entorno
const poolData = {
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
};

const userPool = new CognitoUserPool(poolData);

// Métodos de autenticación de Cognito
export const cognitoAuth = {
    userPool,

    // Registra un nuevo usuario y envía código de verificación al email
    signUp: (email, password, attributes = {}) => {
        return new Promise((resolve, reject) => {
            const attributeList = [];
            for (const [key, value] of Object.entries(attributes)) {
                attributeList.push({ Name: key, Value: value });
            }

            userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result.user);
            });
        });
    },

    // Inicia sesión y devuelve los tokens JWT
    signIn: (email, password) => {
        return new Promise((resolve, reject) => {
            const authenticationData = {
                Username: email,
                Password: password,
            };
            const authenticationDetails = new AuthenticationDetails(authenticationData);

            const userData = {
                Username: email,
                Pool: userPool,
            };
            const cognitoUser = new CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    resolve({
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken()
                    });
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // Manejar cambio de contraseña para usuarios migrados
                    delete userAttributes.email_verified;
                    resolve({
                        newPasswordRequired: true,
                        cognitoUser,
                        userAttributes
                    });
                }
            });
        });
    },

    // Completa el cambio de contraseña obligatorio (usuarios migrados)
    completeNewPassword: (cognitoUser, newPassword, attributes) => {
        return new Promise((resolve, reject) => {
            cognitoUser.completeNewPasswordChallenge(newPassword, attributes, {
                onSuccess: (result) => {
                    resolve({
                        accessToken: result.getAccessToken().getJwtToken(),
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken()
                    });
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    },

    // Confirma el registro de un nuevo usuario con el código enviado por email
    confirmSignUp: (email, code) => {
        return new Promise((resolve, reject) => {
            const userData = { Username: email, Pool: userPool };
            const cognitoUser = new CognitoUser(userData);

            cognitoUser.confirmRegistration(code, true, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    },

    // Reenvía el código de confirmación al email del usuario
    resendConfirmationCode: (email) => {
        return new Promise((resolve, reject) => {
            const userData = { Username: email, Pool: userPool };
            const cognitoUser = new CognitoUser(userData);

            cognitoUser.resendConfirmationCode((err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    },

    // Cierra la sesión del usuario actual
    signOut: () => {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
        }
    },

    // Devuelve el usuario autenticado o null
    getCurrentUser: () => {
        return userPool.getCurrentUser();
    },

    // Obtiene la sesión activa con tokens válidos
    getSession: () => {
        return new Promise((resolve, reject) => {
            const currentUser = userPool.getCurrentUser();
            if (!currentUser) {
                reject('No current user');
                return;
            }
            currentUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(session);
            });
        });
    }
};
