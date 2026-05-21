export const filterProductsByCategory = (products: any[], categoryFilter: string) => {
  return products.filter((p: any) => {
    if (!categoryFilter) return true;
    const catId = p.category?._id ?? p.category;
    return catId === categoryFilter;
  });
};

export const filterCategoriesByShop = (categories: any[], shopId: string) => {
  return categories.filter((cat: any) => cat.shopId === shopId);
};
