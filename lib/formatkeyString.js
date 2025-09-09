export const formatString = (str) => {
    if (!str) return '';
    
    // Replace underscores with spaces
    str = str.replace(/_/g, ' ');
    
    // Add space before uppercase letters that follow lowercase letters
    str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Split by spaces and format each word
    return str.split(' ').map(word => {
      const firstChar = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return firstChar + rest;
    }).join(' ');
  };