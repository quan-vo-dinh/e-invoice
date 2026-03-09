# User Creation Flow (BFF -> User Access -> Authorizer -> Keycloak)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client/Tester
    participant BFF as BFF UserController
    participant UCtrl as User-Access UserController (TCP)
    participant USvc as UserService
    participant URepo as UserRepository (Mongo)
    participant ACtrl as Authorizer KeycloakController (TCP)
    participant KSvc as KeycloakHttpService
    participant KToken as Keycloak Token Endpoint
    participant KAdmin as Keycloak Admin Users API

    Client->>BFF: POST /api/v1/users\n{firstName,lastName,email,password,roles[]}
    Note over Client,BFF: HTTP request contains ProcessId metadata

    BFF->>UCtrl: TCP USER.CREATE\n{data, processId}
    UCtrl->>USvc: create(data, processId)

    USvc->>URepo: exists(email)
    URepo-->>USvc: true/false

    alt Email already exists in Mongo
        USvc-->>UCtrl: throw BadRequest(USER_ALREADY_EXISTS)
        UCtrl-->>BFF: RpcException(code=400)
        BFF-->>Client: HTTP 400 via ExceptionInterceptor
    else Email not exists
        USvc->>ACtrl: TCP KEYCLOAK.CREATE_USER\n{email,firstName,lastName,password}
        ACtrl->>KSvc: createUser(data)

        KSvc->>KToken: POST /realms/{realm}/protocol/openid-connect/token\nclient_id + client_secret + grant_type=client_credentials

        alt Invalid client credentials/config
            KToken-->>KSvc: 401 unauthorized_client
            KSvc-->>ACtrl: Axios error 401
            ACtrl-->>USvc: RpcException(code=401)
            USvc-->>BFF: propagate error
            BFF-->>Client: HTTP 401
        else Token issued
            KToken-->>KSvc: 200 {access_token}
            KSvc->>KAdmin: POST /admin/realms/{realm}/users\nAuthorization: Bearer access_token

            alt Missing service-account admin roles
                KAdmin-->>KSvc: 403 Forbidden
                KSvc-->>ACtrl: Axios error 403
                ACtrl-->>USvc: RpcException(code=403)
                USvc-->>BFF: propagate error
                BFF-->>Client: HTTP 403
            else User created in Keycloak
                KAdmin-->>KSvc: 201 Created + Location header
                KSvc->>KSvc: Parse userId from Location

                alt Location header missing userId
                    KSvc-->>ACtrl: throw InternalServerErrorException
                    ACtrl-->>USvc: RpcException(code=500)
                    USvc-->>BFF: propagate error
                    BFF-->>Client: HTTP 500
                else userId parsed
                    KSvc-->>ACtrl: Response.success(userId)
                    ACtrl-->>USvc: userId
                    USvc->>USvc: createUserRequestMapping(data, userId)\nroles[] -> ObjectId[]
                    USvc->>URepo: create(mappedUser)
                    URepo-->>USvc: mongo document created
                    USvc-->>UCtrl: complete
                    UCtrl-->>BFF: Response.success(HTTP_MESSAGE.CREATED)
                    BFF-->>Client: HTTP success response
                end
            end
        end
    end
```

## Runtime Preconditions

- `KEYCLOAK_HOST`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET` must match the running Keycloak realm and client.
- The service-account token used by `client_credentials` must have permission to call `POST /admin/realms/{realm}/users`.
- MongoDB must be reachable for `exists(email)` and `create(user)` in UserRepository.

## Important Note About Flows

- Browser login URL `/protocol/openid-connect/auth?response_type=code...` validates Authorization Code flow only.
- This create-user backend flow uses Client Credentials flow (`grant_type=client_credentials`), so it can still fail even when Authorization Code works.

## Code Paths Referenced

- `apps/bff/src/app/modules/user/controllers/user.controller.ts`
- `apps/user-access/src/app/modules/user/controllers/user.controller.ts`
- `apps/user-access/src/app/modules/user/services/user.service.ts`
- `apps/user-access/src/app/modules/user/repositories/user.repository.ts`
- `apps/user-access/src/app/modules/user/mapper/user-request.mapper.ts`
- `apps/authorizer/src/app/keycloak/controllers/keycloak.controller.ts`
- `apps/authorizer/src/app/keycloak/services/keycloak-http.service.ts`
- `libs/interceptors/src/lib/exception.interceptor.ts`
- `libs/interceptors/src/lib/tcpLogging.interceptor.ts`
