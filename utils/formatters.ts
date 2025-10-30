export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'kharcha':
      return '#FF6B6B';
    case 'income':
      return '#51CF66';
    case 'udhar':
      return '#FFD43B';
    default:
      return '#94A3B8';
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'kharcha':
      return 'Expense';
    case 'income':
      return 'Income';
    case 'udhar':
      return 'Udhar';
    default:
      return type;
  }
};
