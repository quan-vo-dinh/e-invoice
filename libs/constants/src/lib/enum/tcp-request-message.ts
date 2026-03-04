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

export const TCP_REQUEST_MESSAGE = {
  INVOICE,
  PRODUCT,
};
