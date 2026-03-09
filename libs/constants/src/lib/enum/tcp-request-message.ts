enum INVOICE {
  CREATE = 'invoice.create',
  GET_BY_ID = 'invoice.get_by_id',
  GET_LIST = 'invoice.get_list',
  UPDATE = 'invoice.update',
  DELETE = 'invoice.delete',
}

enum PRODUCT {
  CREATE = 'product.create',
  GET_BY_ID = 'product.get_by_id',
  GET_LIST = 'product.get_list',
  UPDATE = 'product.update',
  DELETE = 'product.delete',
}

enum USER {
  CREATE = 'user_access.create',
  GET_BY_ID = 'user_access.get_by_id',
  GET_LIST = 'user_access.get_list',
  UPDATE = 'user_access.update',
  DELETE = 'user_access.delete',
}

enum KEYCLOAK {
  CREATE_USER = 'keycloak.create_user',
  GET_USER_BY_ID = 'keycloak.get_user_by_id',
  GET_USERS = 'keycloak.get_users',
  UPDATE_USER = 'keycloak.update_user',
  DELETE_USER = 'keycloak.delete_user',
}

export const TCP_REQUEST_MESSAGE = {
  INVOICE,
  PRODUCT,
  USER,
  KEYCLOAK,
};
