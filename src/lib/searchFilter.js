export const filterItemsBySearch = (items, searchQuery) => {
  if (!searchQuery.trim()) return items;
  
  const query = searchQuery.toLowerCase();
  
  return items.filter(item => {
    const productName = item.productName?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    
    return productName.includes(query) || 
           description.includes(query) || 
           category.includes(query);
  });
};
