export const handleProductSearchAction = async (productStore: any, shopId: string, searchPhrase: string, productPageRef: any) => {
  productPageRef.value = 1;
  if (searchPhrase.trim()) {
    await productStore.searchProducts({ shopId, text: searchPhrase.trim() });
  } else {
    await productStore.fetchProductsByShop(shopId);
  }
};

export const handleSimpleProductSearch = async (
  productStore: any, 
  shopId: string, 
  searchPhrase: string,
  categoryId?: string,
  sortBySoldAmount?: string
) => {
  if (searchPhrase.trim() || categoryId || sortBySoldAmount) {
    await productStore.searchProducts({
      shopId,
      text: searchPhrase.trim(),
      categoryId,
      sortBySoldAmount
    });
  } else {
    await productStore.fetchProductsByShop(shopId);
  }
};

export const handleSimpleOrderSearch = async (
  orderStore: any, 
  shopId: string, 
  searchPhrase: string, 
  status?: string, 
  startDate?: string, 
  endDate?: string
) => {
  if (searchPhrase.trim() || startDate || endDate) {
    await orderStore.searchOrders({
      shopId,
      text: searchPhrase.trim(),
      status,
      startDate,
      endDate
    });
  } else {
    await orderStore.filterByStatus(status, shopId);
  }
}