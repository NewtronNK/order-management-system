export const initialAddressForm = () => ({
  name: '',
  detail: '',
  province: '',
  district: '',
  subdistrict: '',
  postcode: '',
  contact: ''
});

export const initialOrderForm = (defaultAddressId: string = '') => ({
  sAddId: defaultAddressId,
  paymentMethod: '',
  delivery: '',
  orderDate: ''
});

export const initialErrors = () => ({
  name: '',
  email: '',
  addressName: '',
  province: '',
  district: '',
  postcode: '',
  addressContact: '',
  shopName: '',
  productName: '',
  productCode: '',
  stock: '',
  price: ''
});

export const initialShopForm = () => ({
  name: '',
  description: '',
  email: '',
  contact: '',
  businessType: '',
  addressName: '',
  province: '',
  district: '',
  postcode: '',
  addressContact: '',
  addressDetails: '',
  skipAddress: false
});

export const initialProductForm = () => ({
  productName: '',
  productCode: '',
  productDesc: '',
  stock: 0,
  category: '',
  price: 0
});

export const initialSearchForm = () => ({
  startDate: '',
  endDate: '',
  message: ''
});

export const initialPasswordForm = () => ({
  oldPassword: '',
  newPassword: ''
});

export const initialNameForm = () => ({
  newName: ''
});