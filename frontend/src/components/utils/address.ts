export const getDefaultAddress = (shopStore: any) => {
  return shopStore.currentShop?.addresses?.find((a: any) => a.isDefault) ?? null;
};

export const getFilteredAddresses = (shopStore: any) => {
  return shopStore.currentShop?.addresses || [];
};
