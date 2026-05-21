export const validateEmail = (email: string): string => {
  if (!email.trim()) return 'Email is required';
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validateShopForm = (form: any, errors: any): boolean => {
  let isValid = true;
  errors.shopName = '';
  errors.email = '';

  if (!form.name.trim()) {
    errors.shopName = 'Shop Name is required';
    isValid = false;
  }

  const emailError = validateEmail(form.email);
  if (emailError) {
    errors.email = emailError;
    isValid = false;
  }

  return isValid;
};

export const validateProductForm = (form: any, errors: any): boolean => {
  let isValid = true;
  errors.productName = '';
  errors.productCode = '';
  errors.stock = '';
  errors.price = '';

  if (!form.productName.trim()) {
    errors.productName = 'Product Name is required';
    isValid = false;
  }
  if (!form.productCode.trim()) {
    errors.productCode = 'Product Code is required';
    isValid = false;
  }
  if (form.stock < 0) {
    errors.stock = 'Stock must not less than zero';
    isValid = false;
  }
  if (form.price < 0) {
    errors.price = 'Price must not less than zero';
    isValid = false;
  }

  return isValid;
};

export const validateAddressForm = (form: any, errors: any): boolean => {
  let isValid = true;
  errors.addressName = '';
  errors.province = '';
  errors.district = '';
  errors.postcode = '';
  errors.addressContact = '';

  if (!form.addressName?.trim()) {
    errors.addressName = 'Address name is required';
    isValid = false;
  }
  if (!form.province?.trim()) {
    errors.province = 'Province is required';
    isValid = false;
  }
  if (!form.district?.split(',')[1]?.trim()) {
    errors.district = 'Subdistrict is required';
    isValid = false;
  }
  if (!form.district?.split(',')[0]) {
    errors.district = 'District is required';
    isValid = false;
  }
  if (!form.postcode?.trim()) {
    errors.postcode = 'Postcode is required';
    isValid = false;
  }
  if (!form.addressContact?.trim()) {
    errors.addressContact = 'Contact is required';
    isValid = false;
  }

  return isValid;
};

export const validateChangePassword = (form: any, errors: any): boolean => {
  let isValid = true;
  errors.oldPassword = '';
  errors.newPassword = '';

  if (!form.oldPassword?.trim()) {
    errors.oldPassword = 'Please enter your old password';
    isValid = false;
  }

  if (!form.newPassword?.trim()) {
    errors.newPassword = 'Please enter your new password';
    isValid = false;
  }

  return isValid;
};

